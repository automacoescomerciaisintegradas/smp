import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const blockId = searchParams.get('blockId');
    const status = searchParams.get('status');

    const where: any = {};
    if (classId) where.classId = classId;
    if (blockId) where.blockId = blockId;
    if (status) where.status = status;

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        class: true,
        block: true,
        loyaltyPoints: true,
        referrals: true
      },
      orderBy: { enrolledAt: 'desc' }
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { classId, blockId, studentName, studentEmail, studentPhone, amount, notes, promotionCode } = body;

    let finalAmount = amount;
    let promotionData: any = null;

    // Apply promotion if code provided
    if (promotionCode) {
      const promotion = await prisma.promotion.findUnique({
        where: { code: promotionCode }
      });

      if (promotion && promotion.isActive) {
        if (promotion.type === 'percentage') {
          finalAmount = amount * (1 - promotion.discount / 100);
        } else {
          finalAmount = Math.max(0, amount - promotion.discount);
        }

        promotionData = promotion;
      }
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        classId,
        blockId: blockId || null,
        userId: session.user.id!,
        studentName,
        studentEmail,
        studentPhone,
        amount: finalAmount,
        notes
      }
    });

    // Use promotion if applied
    if (promotionData) {
      await prisma.promotionUse.create({
        data: {
          promotionId: promotionData.id,
          userId: session.user.id!,
          enrollmentId: enrollment.id,
          discountApplied: amount - finalAmount
        }
      });

      await prisma.promotion.update({
        where: { id: promotionData.id },
        data: {
          usedCount: { increment: 1 }
        }
      });
    }

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
