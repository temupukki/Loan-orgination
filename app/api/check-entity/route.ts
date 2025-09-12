// app/api/check-entity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number, type } = body;

    if (!number || !type) {
      return NextResponse.json(
        { error: 'Number and type are required' },
        { status: 400 }
      );
    }

    let exists = false;

    if (type === 'customer') {
      const customer = await prisma.customer.findUnique({
        where: { customerNumber: number }
      });
      exists = !!customer;
    } else if (type === 'company') {
      const company = await prisma.customer.findUnique({
        where: { customerNumber: number }
      });
      exists = !!company;
    }

    return NextResponse.json({ exists });
  } catch (error) {
    console.error('Error checking entity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}