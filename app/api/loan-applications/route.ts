// app/api/loan-applications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      customerId,
      purpose,
      loanType,
      amount,
      period,
      repaymentMode,
      economicSector,
      collaterals
    } = body;

    // Validate required fields
    if (!customerId || !purpose || !loanType || !amount || !period || !repaymentMode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate application reference number
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const applicationRef = `DB/LFF/ADD/KIR/JD/${random}/${year}`;

    // Create loan application with transaction
    const loanApplication = await prisma.$transaction(async (tx) => {
      // Create the loan application
      const application = await tx.loanApplication.create({
        data: {
          applicationRef,
          customerId,
          purpose,
          loanType,
          amount: parseFloat(amount),
          period: parseInt(period),
          repaymentMode,
          economicSector: Array.isArray(economicSector) ? economicSector : [economicSector],
          status: 'submitted'
        }
      });

      // Create collaterals if provided
      if (collaterals && Array.isArray(collaterals)) {
        await Promise.all(
          collaterals.map((collateral: any) =>
            tx.collateral.create({
              data: {
                loanApplicationId: application.id,
                type: collateral.type,
                description: collateral.description,
                estimatedValue: parseFloat(collateral.estimatedValue),
                titleDeedNo: collateral.titleDeedNo,
                taxCustomsCharge: parseFloat(collateral.taxCustomsCharge),
                netValue: parseFloat(collateral.netValue),
                documentUrl: collateral.documentUrl
              }
            })
          )
        );
      }

      // Create initial transaction log
      await tx.transaction.create({
        data: {
          loanApplicationId: application.id,
          type: 'status_change',
          description: 'Loan application submitted',
          performedBy: 'customer'
        }
      });

      return application;
    });

    return NextResponse.json({
      success: true,
      data: loanApplication,
      message: 'Loan application submitted successfully'
    });

  } catch (error) {
    console.error('Error creating loan application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
    let whereClause = {};
    if (customerId) {
      whereClause = { customerId };
    }

    const applications = await prisma.loanApplication.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            customerNumber: true
          }
        },
        collaterals: true,
        _count: {
          select: {
            documents: true,
            approvals: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    console.error('Error fetching loan applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}