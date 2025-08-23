import { NextRequest, NextResponse } from 'next/server';

import { parseDateSafe } from '@/app/utils/dateUtils';
import { PrismaClient } from "@prisma/client"; const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      // Customer basic info (all required in your schema)
      customerNumber,
      tinNumber,
      firstName,
      middleName,
      lastName,
      mothersName,
      gender,
      maritalStatus,
      dateOfBirth,
      nationalId,
      phone,
      email,
      region,
      zone,
      city,
      subcity,
      woreda,
      monthlyIncome,
      status,
      accountType,
      
      // Business information (all required except optional fields)
      majorLineBusiness,
      majorLineBusinessUrl,
      otherLineBusiness,
      otherLineBusinessUrl,
      dateOfEstablishmentMLB,
      dateOfEstablishmentOLB,
      
      // Loan application details (all required)
      purposeOfLoan,
      loanType,
      loanAmount,
      loanPeriod,
      modeOfRepayment,
      economicSector,
      customerSegmentation,
      creditInitiationCenter,
      applicationReferenceNumber,
      
      // Document URLs (all required except shareholdersDetailsUrl)
      nationalidUrl,
      agreementFormUrl,
      applicationFormUrl,
      shareholdersDetailsUrl,
      creditProfileUrl,
      transactionProfileUrl,
      collateralProfileUrl,
      financialProfileUrl,
      
    } = body;

    // Validate all required fields based on your schema
    const requiredFields = [
      'customerNumber', 'tinNumber', 'firstName', 'lastName', 'gender',
      'maritalStatus', 'dateOfBirth', 'nationalId', 'phone', 'region',
      'zone', 'city', 'subcity', 'woreda', 'monthlyIncome', 'status',
      'accountType', 'nationalidUrl', 'agreementFormUrl', 'majorLineBusiness',
      'majorLineBusinessUrl', 'dateOfEstablishmentMLB', 'purposeOfLoan',
      'loanType', 'loanAmount', 'loanPeriod', 'modeOfRepayment', 'economicSector',
      'customerSegmentation', 'creditInitiationCenter', 'applicationFormUrl',
      'creditProfileUrl', 'transactionProfileUrl', 'collateralProfileUrl',
      'financialProfileUrl'
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missingFields: missingFields
        },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { customerNumber }
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this customer number already exists' },
        { status: 400 }
      );
    }

    // Check if TIN number already exists
    const existingTin = await prisma.customer.findUnique({
      where: { tinNumber }
    });

    if (existingTin) {
      return NextResponse.json(
        { error: 'Customer with this TIN number already exists' },
        { status: 400 }
      );
    }

    // Parse date fields
    const parsedDateOfBirth = parseDateSafe(dateOfBirth);
    const parsedDateEstablishmentMLB = parseDateSafe(dateOfEstablishmentMLB);
    const parsedDateEstablishmentOLB = parseDateSafe(dateOfEstablishmentOLB);

    if (!parsedDateOfBirth) {
      return NextResponse.json(
        { error: 'Invalid date of birth format' },
        { status: 400 }
      );
    }

    if (!parsedDateEstablishmentMLB) {
      return NextResponse.json(
        { error: 'Invalid major business establishment date format' },
        { status: 400 }
      );
    }

    // Generate application reference number if not provided
    const finalApplicationRef = applicationReferenceNumber || generateApplicationReference();

    // Create customer with all data according to your schema
    const customer = await prisma.customer.create({
      data: {
        // Customer basic info (all required)
        customerNumber,
        tinNumber,
        firstName,
        middleName: middleName || null,
        lastName,
        mothersName: mothersName || null,
        gender,
        maritalStatus,
        dateOfBirth: parsedDateOfBirth,
        nationalId,
        phone,
        email: email || null,
        region,
        zone,
        city,
        subcity,
        woreda,
        monthlyIncome: parseFloat(monthlyIncome),
        status,
        accountType,
        
        // Business information
        majorLineBusiness,
        majorLineBusinessUrl,
        otherLineBusiness: otherLineBusiness || null,
        otherLineBusinessUrl: otherLineBusinessUrl || null,
        dateOfEstablishmentMLB: parsedDateEstablishmentMLB,
        dateOfEstablishmentOLB: parsedDateEstablishmentOLB,
        
        // Loan application details (all required)
        purposeOfLoan,
        loanType,
        loanAmount: parseFloat(loanAmount),
        loanPeriod: parseInt(loanPeriod),
        modeOfRepayment,
        economicSector,
        customerSegmentation,
        creditInitiationCenter,
        applicationReferenceNumber: finalApplicationRef,
        
        // Document URLs
        nationalidUrl,
        agreementFormUrl,
        applicationFormUrl,
        shareholdersDetailsUrl: shareholdersDetailsUrl || null,
        creditProfileUrl,
        transactionProfileUrl,
        collateralProfileUrl,
        financialProfileUrl,
        
        // Application status (defaults to PENDING from schema)
        applicationStatus: 'PENDING',
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Customer and loan application created successfully',
      data: {
        id: customer.id,
        customerNumber: customer.customerNumber,
        applicationReferenceNumber: customer.applicationReferenceNumber,
        applicationStatus: customer.applicationStatus,
        createdAt: customer.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

// Helper function to generate application reference
function generateApplicationReference(): string {
  const prefix = "PUKKI";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

// Handle other methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create a customer.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create a customer.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create a customer.' },
    { status: 405 }
  );
}