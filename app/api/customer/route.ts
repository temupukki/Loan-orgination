import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { parseDateSafe } from '@/app/utils/dateUtils';
import { PrismaClient } from "@prisma/client"; 
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get the session
   const session = await auth.api.getSession({
     headers: await headers(),
   });
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
    
    // Extract relation manager ID from session
    const relationManagerID = session.user.id;
    
    const body = await request.json();
    
    const {
      // Customer basic info (all required in your schema)
      customerNumber,
      tinNumber,
      companyName ,
      annualRevenue,
      firstName,
      middleName,
      lastName,
      mothersName,
      gender,
      maritalStatus,
     
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
      
      majorLineBusiness,
      majorLineBusinessUrl,
      otherLineBusiness,
      otherLineBusinessUrl,
      dateOfEstablishmentMLB,
      dateOfEstablishmentOLB,
 
      purposeOfLoan,
      loanType,
      loanAmount,
      loanPeriod,
      modeOfRepayment,
      economicSector,
      customerSegmentation,
      creditInitiationCenter,
      applicationReferenceNumber,
      
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

 
    const parsedDateEstablishmentMLB = parseDateSafe(dateOfEstablishmentMLB);
    const parsedDateEstablishmentOLB = parseDateSafe(dateOfEstablishmentOLB);


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
         companyName ,
          annualRevenue,
        firstName,
        middleName: middleName || null,
        lastName,
        mothersName: mothersName || null,
        gender,
        maritalStatus,
     
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
        
        // Add relation manager ID from session
        relationManagerID,
        
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
        relationManagerID: customer.relationManagerID,
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