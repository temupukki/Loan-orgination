import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"; 
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {
      applicationStatus: 'PENDING'
    };

    if (search) {
      where.OR = [
        { customerNumber: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { applicationReferenceNumber: { contains: search, mode: 'insensitive' } },
        { tinNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Fetch pending applications
    const [applications, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        select: {
          id: true,
          customerNumber: true,
          firstName: true,
          lastName: true,
          tinNumber: true,
          applicationReferenceNumber: true,
          loanAmount: true,
          loanType: true,
          purposeOfLoan: true,
          applicationStatus: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.customer.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching pending applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}