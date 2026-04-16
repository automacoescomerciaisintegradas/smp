import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enrollmentId, method, gateway, installments } = body;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { class: true, block: true }
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        enrollmentId,
        amount: enrollment.amount,
        gateway: gateway || 'mercadopago',
        method: method || 'pix',
        installments: installments || 1,
        status: 'pending'
      }
    });

    // Generate payment preference based on gateway
    let paymentUrl: string | null = null;
    let pixCode: string | null = null;

    if (gateway === 'mercadopago') {
      // MercadoPago integration placeholder
      // In production, use @mercadopago/sdk-react
      paymentUrl = `/api/payments/mercadopago/${payment.id}`;
    } else if (gateway === 'stripe') {
      // Stripe integration placeholder
      paymentUrl = `/api/payments/stripe/${payment.id}`;
    }

    return NextResponse.json({
      payment,
      paymentUrl,
      pixCode
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get('enrollmentId');

    const where: any = {};
    if (enrollmentId) where.enrollmentId = enrollmentId;

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
