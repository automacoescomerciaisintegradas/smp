import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get loyalty program and points for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    // Get user's total points
    const pointsSummary = await prisma.loyaltyPoint.groupBy({
      by: ['userId'],
      where: { userId },
      _sum: { points: true }
    });

    const totalPoints = pointsSummary[0]?._sum.points || 0;

    // Get available rewards
    const rewards = await prisma.reward.findMany({
      where: { isActive: true },
      orderBy: { pointsCost: 'asc' }
    });

    // Get user's redemptions
    const redemptions = await prisma.rewardRedemption.findMany({
      where: { userId },
      include: { reward: true },
      orderBy: { redeemedAt: 'desc' }
    });

    // Get points history
    const pointsHistory = await prisma.loyaltyPoint.findMany({
      where: { userId },
      include: { program: true },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({
      totalPoints,
      rewards,
      redemptions,
      pointsHistory
    });
  } catch (error) {
    console.error('Error fetching loyalty data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Redeem points for a reward
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rewardId, enrollmentId } = body;

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId }
    });

    if (!reward || !reward.isActive) {
      return NextResponse.json({ error: 'Reward not available' }, { status: 400 });
    }

    // Check stock
    if (reward.stock !== null && reward.redeemed >= reward.stock) {
      return NextResponse.json({ error: 'Reward out of stock' }, { status: 400 });
    }

    // Get user's total points
    const pointsSummary = await prisma.loyaltyPoint.groupBy({
      by: ['userId'],
      where: { userId: session.user.id! },
      _sum: { points: true }
    });

    const totalPoints = pointsSummary[0]?._sum.points || 0;

    if (totalPoints < reward.pointsCost) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
    }

    // Create redemption
    const redemption = await prisma.rewardRedemption.create({
      data: {
        rewardId,
        userId: session.user.id!,
        enrollmentId: enrollmentId || null,
        pointsSpent: reward.pointsCost
      }
    });

    // Deduct points
    await prisma.loyaltyPoint.create({
      data: {
        programId: reward.programId,
        enrollmentId: enrollmentId || null,
        userId: session.user.id!,
        points: -reward.pointsCost,
        type: 'redeemed',
        reason: 'reward_redemption',
        referenceId: redemption.id
      }
    });

    // Update reward redeemed count
    await prisma.reward.update({
      where: { id: rewardId },
      data: { redeemed: { increment: 1 } }
    });

    return NextResponse.json(redemption, { status: 201 });
  } catch (error) {
    console.error('Error redeeming points:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Award points to user
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, enrollmentId, programId, points, type, reason, referenceId, expiresAt } = body;

    const loyaltyPoint = await prisma.loyaltyPoint.create({
      data: {
        userId: userId || session.user.id!,
        enrollmentId,
        programId,
        points,
        type,
        reason,
        referenceId,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    return NextResponse.json(loyaltyPoint);
  } catch (error) {
    console.error('Error awarding points:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
