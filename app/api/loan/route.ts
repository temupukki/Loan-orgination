import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"; 
const prisma = new PrismaClient();

// GET - Fetch loan applications with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const customerNumber = searchParams.get('customerNumber');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    const where: any = {};
    
    if (customerNumber) {
      where.customerNumber = customerNumber;
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { customerNumber: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { applicationReferenceNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Fetch customers with loan applications
    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          shareholders: true,
          loanRequests: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching loan applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle other methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch loan applications.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch loan applications.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch loan applications.' },
    { status: 405 }
  );
}