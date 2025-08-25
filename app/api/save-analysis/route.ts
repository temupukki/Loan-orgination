import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      applicationReferenceNumber,
      financialProfileUrl,
      pestelAnalysisUrl,
      swotAnalysisUrl,
      riskAssessmentUrl,
      esgAssessmentUrl,
      financialNeedUrl,
      analystConclusion,
      analystRecommendation,
      rmRecommendation,
    } = body;

    if (!applicationReferenceNumber) {
      return NextResponse.json({ error: "applicationReferenceNumber is required" }, { status: 400 });
    }

    // ✅ Find the customer by reference number
    const customer = await prisma.customer.findUnique({
      where: { applicationReferenceNumber },
      select: { id: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // ✅ Upsert LoanAnalysis record (create if not exists, else update)
    const loanAnalysis = await prisma.loanAnalysis.upsert({
      where: {
        applicationReferenceNumber: applicationReferenceNumber,
      },
      create: {
        applicationReferenceNumber,
        
        financialProfileUrl,
        pestelAnalysisUrl,
        swotAnalysisUrl,
        riskAssessmentUrl,
        esgAssessmentUrl,
        financialNeedUrl,
        analystConclusion,
        analystRecommendation,
        rmRecommendation,
      },
      update: {
        financialProfileUrl,
        pestelAnalysisUrl,
        swotAnalysisUrl,
        riskAssessmentUrl,
        esgAssessmentUrl,
        financialNeedUrl,
        analystConclusion,
        analystRecommendation,
        rmRecommendation,
      },
    });

    return NextResponse.json({ success: true, loanAnalysis });
  } catch (err: any) {
    console.error("Save Analysis Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
