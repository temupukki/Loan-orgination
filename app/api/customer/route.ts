import { NextRequest, NextResponse } from 'next/server';

import { parseDateSafe, isValidDate } from '@/app/utils/dateUtils';
import { PrismaClient } from "@prisma/client"; 
const prisma = new PrismaClient();

// Helper function to safely parse shareholders data
const parseShareholders = (shareholders: any): any[] => {
  if (!shareholders) return [];
  
  // If it's already an array, return it
  if (Array.isArray(shareholders)) {
    return shareholders;
  }
  
  // If it's an object, try to convert it to array
  if (typeof shareholders === 'object' && shareholders !== null) {
    // Check if it's an object with numeric keys (like {0: {...}, 1: {...}})
    if (Object.keys(shareholders).every(key => !isNaN(Number(key)))) {
      return Object.values(shareholders);
    }
    
    // If it's a single shareholder object, wrap it in an array
    if (shareholders.name && shareholders.shareValue !== undefined) {
      return [shareholders];
    }
  }
  
  return [];
};

// Helper function to safely parse loan requests data
const parseLoanRequests = (loanRequests: any): any[] => {
  if (!loanRequests) return [];
  
  // If it's already an array, return it
  if (Array.isArray(loanRequests)) {
    return loanRequests;
  }
  
  // If it's an object, try to convert it to array
  if (typeof loanRequests === 'object' && loanRequests !== null) {
    // Check if it's an object with numeric keys
    if (Object.keys(loanRequests).every(key => !isNaN(Number(key)))) {
      return Object.values(loanRequests);
    }
    
    // If it's a single loan request object, wrap it in an array
    if (loanRequests.type && loanRequests.amount !== undefined) {
      return [loanRequests];
    }
  }
  
  return [];
};

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received request body:', JSON.stringify(body, null, 2));
    
    const {
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
      accountType,
      // Business fields
      majorLineBusiness,
      otherLineBusiness,
      dateOfEstablishmentMLB,
      dateOfEstablishmentOLB,
      // Loan fields
      purposeOfLoan,
      loanType,
      loanAmount,
      loanPeriod,
      modeOfRepayment,
      economicSector,
      customerSegmentation,
      creditInitiationCenter,
      applicationReferenceNumber,
      applicationDate,
      lastDocumentReceivedDate,
      // Document URLs
      nationalidUrl,
      agreementFormUrl,
      applicationFormUrl,
      shareholdersDetailsUrl,
      creditProfileUrl,
      transactionProfileUrl,
      collateralProfileUrl,
      financialProfileUrl,
      // Relations
      shareholders,
      loanRequests,
    } = body;

    // Validate required fields
    if (!customerNumber || !tinNumber || !firstName || !lastName || !dateOfBirth) {
      return NextResponse.json(
        { error: 'Customer number, TIN, first name, last name, and date of birth are required' },
        { status: 400 }
      );
    }

    // Validate date of birth
    if (!isValidDate(dateOfBirth)) {
      return NextResponse.json(
        { error: 'Valid date of birth is required' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { customerNumber },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer already exists' },
        { status: 400 }
      );
    }

    // Parse date fields safely
    const parsedDateOfBirth = parseDateSafe(dateOfBirth);
    const parsedDateEstablishmentMLB = parseDateSafe(dateOfEstablishmentMLB);
    const parsedDateEstablishmentOLB = parseDateSafe(dateOfEstablishmentOLB);
    const parsedApplicationDate = parseDateSafe(applicationDate);
    const parsedLastDocumentDate = parseDateSafe(lastDocumentReceivedDate);

    // Safely parse shareholders and loan requests
    const parsedShareholders = parseShareholders(shareholders);
    const parsedLoanRequests = parseLoanRequests(loanRequests);

    console.log('Parsed shareholders:', parsedShareholders);
    console.log('Parsed loan requests:', parsedLoanRequests);

    // Create customer with nested relations
    const customer = await prisma.customer.create({
      data: {
        customerNumber,
        tinNumber,
        firstName,
        middleName: middleName || null,
        lastName,
        mothersName: mothersName || null,
        gender: gender || 'Unknown',
        maritalStatus: maritalStatus || 'Unknown',
        dateOfBirth: parsedDateOfBirth!,
        nationalId: nationalId || '',
        phone: phone || '',
        email: email || '',
        region: region || '',
        zone: zone || '',
        city: city || '',
        subcity: subcity || '',
        woreda: woreda || '',
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : 0,
        accountType: accountType || 'Personal',
        
        // Business fields
        majorLineBusiness: majorLineBusiness || null,
        otherLineBusiness: otherLineBusiness || null,
        dateOfEstablishmentMLB: parsedDateEstablishmentMLB,
        dateOfEstablishmentOLB: parsedDateEstablishmentOLB,
        
        // Loan fields
        purposeOfLoan: purposeOfLoan || null,
        loanType: loanType || null,
        loanAmount: loanAmount ? parseFloat(loanAmount) : null,
        loanPeriod: loanPeriod ? parseInt(loanPeriod) : null,
        modeOfRepayment: modeOfRepayment || null,
        economicSector: economicSector || null,
        customerSegmentation: customerSegmentation || null,
        creditInitiationCenter: creditInitiationCenter || null,
        applicationReferenceNumber: applicationReferenceNumber || null,
        applicationDate: parsedApplicationDate,
        lastDocumentReceivedDate: parsedLastDocumentDate,
        
        // Document URLs
        nationalidUrl: nationalidUrl || null,
        agreementFormUrl: agreementFormUrl || null,
        applicationFormUrl: applicationFormUrl || null,
        shareholdersDetailsUrl: shareholdersDetailsUrl || null,
        creditProfileUrl: creditProfileUrl || null,
        transactionProfileUrl: transactionProfileUrl || null,
        collateralProfileUrl: collateralProfileUrl || null,
        financialProfileUrl: financialProfileUrl || null,
        
        // Relations
        shareholders: {
          create: parsedShareholders.map((sh: any) => ({
            companyName: sh.companyName || 'Main Company',
            name: sh.name || '',
            shareValue: sh.shareValue ? parseFloat(sh.shareValue) : 0,
            sharePercentage: sh.sharePercentage ? parseFloat(sh.sharePercentage) : 0,
            nationality: sh.nationality || null,
            idNumber: sh.idNumber || null,
            address: sh.address || null,
            phone: sh.phone || null,
            email: sh.email || null,
            isDirector: sh.isDirector || false,
            position: sh.position || null,
            dateOfBirth: parseDateSafe(sh.dateOfBirth),
          })),
        },
        loanRequests: {
          create: parsedLoanRequests.map((lr: any) => ({
            type: lr.type || '',
            amount: lr.amount ? parseFloat(lr.amount) : 0,
            period: lr.period ? parseInt(lr.period) : 0,
            repaymentMode: lr.repaymentMode || '',
            remark: lr.remark || null,
            status: 'pending',
          })),
        },
      },
      include: {
        shareholders: true,
        loanRequests: true,
      },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Customer created successfully',
      customer 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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