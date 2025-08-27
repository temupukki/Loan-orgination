'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from 'sonner';

// Import Supabase client from your library
import { supabase } from '@/lib/supabase';
import { authClient } from "@/lib/auth-client"
import { SaveReviewButton } from '@/components/Savereview';

// Define the interface for the LoanAnalysis model
interface LoanAnalysis {
  id: string;
  applicationReferenceNumber: string;
  financialProfileUrl?: string;
  pestelAnalysisUrl?: string;
  swotAnalysisUrl?: string;
  riskAssessmentUrl?: string;
  esgAssessmentUrl?: string;
  financialNeedUrl?: string;
  analystConclusion?: string;
  analystRecommendation?: string;
  rmRecommendation?: string;
  pestelanalysisScore?: number;
 swotanalysisScore?: number;
  riskassesmentScore?: number;
  esgassesmentScore?: number;
  financialneedScore?:number;
  overallScore?: number;
  reviewNotes?: string;
  decision?: string;
}

// Update the Customer interface to include the LoanAnalysis relation
interface Customer {
  id: string;
  applicationReferenceNumber: string;
  customerNumber: string;
  tinNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  mothersName?: string;
  gender: string;
  maritalStatus: string;
  dateOfBirth: string;
  nationalId: string;
  phone: string;
  email?: string;
  region: string;
  zone: string;
  city: string;
  subcity: string;
  woreda: string;
  monthlyIncome: number;
  status: string;
  accountType: string;
  nationalidUrl: string;
  agreementFormUrl: string;
  majorLineBusiness: string;
  majorLineBusinessUrl: string;
  otherLineBusiness?: string;
  otherLineBusinessUrl?: string;
  dateOfEstablishmentMLB: string;
  dateOfEstablishmentOLB?: string;
  purposeOfLoan: string;
  loanType: string;
  loanAmount: number;
  loanPeriod: number;
  modeOfRepayment: string;
  economicSector: string;
  customerSegmentation: string;
  creditInitiationCenter: string;
  applicationFormUrl: string;
  shareholdersDetailsUrl?: string;
  creditProfileUrl: string;
  transactionProfileUrl: string;
  collateralProfileUrl: string;
  financialProfileUrl: string;
  applicationStatus: string;
  createdAt: string;
  updatedAt: string;
  loanAnalysis: LoanAnalysis | null;
}

export default function PendingCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loanAnalyses, setLoanAnalyses] = useState<Record<string, LoanAnalysis>>({});
  const [reviewData, setReviewData] = useState<Record<string, Partial<LoanAnalysis>>>({});

  useEffect(() => {
    const fetchPendingCustomers = async () => {
      try {
        const response = await fetch(`/api/supervisor?status=SUPERVISOR_REVIEWING`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch pending customers');
        }
        const data = await response.json();
        setCustomers(data);
        
        // Fetch loan analyses for all customers
        await fetchAllLoanAnalyses(data);

      } catch (err: any) {
        setError(err.message);
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingCustomers();
  }, []);

  // Function to fetch loan analysis for a specific application reference number
  const fetchLoanAnalysis = async (applicationReferenceNumber: string) => {
    try {
      const response = await fetch(`/api/loan-analysis/${applicationReferenceNumber}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch loan analysis');
      }
      const analysisData = await response.json();
      return analysisData;
    } catch (err: any) {
      console.error(`Error fetching analysis for ${applicationReferenceNumber}:`, err);
      return null;
    }
  };

  // Function to fetch all loan analyses
  const fetchAllLoanAnalyses = async (customersData: Customer[]) => {
    try {
      const analyses: Record<string, LoanAnalysis> = {};
      const reviewDataTemp: Record<string, Partial<LoanAnalysis>> = {};
      
      // Fetch analyses for each customer
      for (const customer of customersData) {
        const analysis = await fetchLoanAnalysis(customer.applicationReferenceNumber);
        if (analysis) {
          analyses[customer.applicationReferenceNumber] = analysis;
          // Initialize review data with existing analysis values, use undefined if the value is 0
          reviewDataTemp[customer.applicationReferenceNumber] = {
            pestelanalysisScore: analysis.pestelanalysisScore,
            swotanalysisScore: analysis.swotanalysisScore,
            riskassesmentScore: analysis.riskassesmentScore,
            esgassesmentScore: analysis.esgassesmentScore,
            financialneedScore: analysis.financialneedScore,
            overallScore: analysis.overallScore,
            reviewNotes: analysis.reviewNotes || '',
            decision: analysis.decision || 'PENDING'
          };
        } else {
          // Initialize empty review data with undefined values
          reviewDataTemp[customer.applicationReferenceNumber] = {
            pestelanalysisScore: undefined,
            swotanalysisScore: undefined,
            riskassesmentScore: undefined,
            esgassesmentScore: undefined,
            financialneedScore: undefined,
            overallScore: undefined,
            reviewNotes: '',
            decision: 'PENDING'
          };
        }
      }
      
      setLoanAnalyses(analyses);
      setReviewData(reviewDataTemp);
    } catch (err: any) {
      console.error('Error fetching loan analyses:', err);
    }
  };

  const handleReviewChange = (refNumber: string, field: keyof LoanAnalysis, value: string | number) => {
    setReviewData(prev => {
      const newState = { ...prev[refNumber] };
      const isScoreField = ['pestelanalysisScore', 'swotanalysisScore', 'riskassesmentScore', 'esgassesmentScore', 'financialneedScore'].includes(field);

      if (isScoreField) {
        let numericValue = typeof value === 'string' ? parseInt(value) : value;
        if (isNaN(numericValue) || numericValue < 0) {
          newState[field] = undefined; // Set to undefined to display placeholder
        } else if (numericValue > 100) {
          newState[field] = 100;
        } else {
          newState[field] = numericValue;
        }

        // Auto-calculate overall score
        const pestelanalysisScore = newState.pestelanalysisScore || 0;
        const swotanalysisScore = newState.swotanalysisScore || 0;
        const riskassesmentScore = newState.riskassesmentScore || 0;
        const esgassesmentScore = newState.esgassesmentScore || 0;
        const financialneedScore = newState.financialneedScore || 0;
        newState.overallScore = (pestelanalysisScore + swotanalysisScore + riskassesmentScore + esgassesmentScore + financialneedScore) / 5;
      } else {
        // This handles the 'reviewNotes' field as a string
        newState[field] = value;
      }

      return {
        ...prev,
        [refNumber]: newState,
      };
    });
  };

  const handleSaveReview = async (refNumber: string) => {
    try {
      const review = reviewData[refNumber];
      
      const response = await fetch('/api/loan-analysis/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationReferenceNumber: refNumber,
          ...review,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save review');
      }

      toast.success('Review saved successfully!');
      // Refresh the analysis data
      await fetchAllLoanAnalyses(customers);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save review');
    }
  };

  const handleRefreshAnalyses = async () => {
    toast.loading('Refreshing loan analyses...');
    await fetchAllLoanAnalyses(customers);
    toast.dismiss();
    toast.success('Loan analyses refreshed!');
  };

  const formatData = (value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === "") {
      return "N/A";
    }
    if (typeof value === 'string' && value.startsWith('http')) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          View Document
        </a>
      );
    }
    return value;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 font-bold';
    if (score >= 60) return 'text-yellow-600 font-bold';
    return 'text-red-600 font-bold';
  };


  
  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-900">
          Pending Applications ⏳
        </h1>
        <Button onClick={handleRefreshAnalyses} variant="outline">
          Refresh Analyses
        </Button>
      </div>

      {isLoading && <div className="text-center text-lg text-gray-600">Fetching pending applications...</div>}
      {error && <div className="text-center text-red-600 text-lg p-4 bg-red-100 rounded-lg">Error: {error}</div>}

      {!isLoading && !error && customers.length === 0 && (
        <div className="text-center text-lg text-gray-500 p-4 bg-white rounded-lg shadow-md">
          <p>There are no pending applications at the moment. 🎉</p>
        </div>
      )}

      {!isLoading && customers.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {customers.map((customer) => {
            const analysis = loanAnalyses[customer.applicationReferenceNumber];
            const review = reviewData[customer.applicationReferenceNumber] || {};
            
            return (
              <Card key={customer.id} className="max-w-6xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{customer.firstName} {customer.middleName} {customer.lastName}</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {customer.applicationStatus}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex justify-between items-center text-sm">
                    <span>Ref: {customer.applicationReferenceNumber}</span>
                    <span>Customer No: {customer.customerNumber}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-700">Personal & Contact Information</h3>
                    <Separator />
                    <p><strong>TIN:</strong> {formatData(customer.tinNumber)}</p>
                    <p><strong>National ID:</strong> {formatData(customer.nationalId)}</p>
                    <p><strong>Phone:</strong> {formatData(customer.phone)}</p>
                    <p><strong>Email:</strong> {formatData(customer.email)}</p>
                    <p><strong>Gender:</strong> {formatData(customer.gender)}</p>
                    <p><strong>Marital Status:</strong> {formatData(customer.maritalStatus)}</p>
                    <p><strong>Date of Birth:</strong> {formatData(new Date(customer.dateOfBirth).toLocaleDateString())}</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-700">Address</h3>
                    <Separator />
                    <p><strong>Region:</strong> {formatData(customer.region)}</p>
                    <p><strong>Zone:</strong> {formatData(customer.zone)}</p>
                    <p><strong>City:</strong> {formatData(customer.city)}</p>
                    <p><strong>Subcity:</strong> {formatData(customer.subcity)}</p>
                    <p><strong>Woreda:</strong> {formatData(customer.woreda)}</p>
                    <p><strong>Monthly Income:</strong> {formatData(customer.monthlyIncome)}</p>
                    <p><strong>Account Type:</strong> {formatData(customer.accountType)}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-700">Business & Financials</h3>
                    <Separator />
                    <p><strong>Major Line of Business:</strong> {formatData(customer.majorLineBusiness)}</p>
                    <p><strong>Date of Establishment (MLB):</strong> {formatData(new Date(customer.dateOfEstablishmentMLB).toLocaleDateString())}</p>
                    <p><strong>Economic Sector:</strong> {formatData(customer.economicSector)}</p>
                    <p><strong>Customer Segmentation:</strong> {formatData(customer.customerSegmentation)}</p>
                    <p><strong>Credit Initiation Center:</strong> {formatData(customer.creditInitiationCenter)}</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-700">Loan Details</h3>
                    <Separator />
                    <p><strong>Loan Type:</strong> {formatData(customer.loanType)}</p>
                    <p><strong>Loan Amount:</strong> {formatData(customer.loanAmount)}</p>
                    <p><strong>Loan Period:</strong> {formatData(customer.loanPeriod)} months</p>
                    <p><strong>Mode of Repayment:</strong> {formatData(customer.modeOfRepayment)}</p>
                    <p><strong>Purpose of Loan:</strong> {formatData(customer.purposeOfLoan)}</p>
                  </div>
                  
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="font-semibold text-lg text-gray-700">Documents</h3>
                    <Separator />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <p><strong>National ID:</strong> {formatData(customer.nationalidUrl)}</p>
                      <p><strong>Agreement Form:</strong> {formatData(customer.agreementFormUrl)}</p>
                      <p><strong>Major Business Doc:</strong> {formatData(customer.majorLineBusinessUrl)}</p>
                      <p><strong>Application Form:</strong> {formatData(customer.applicationFormUrl)}</p>
                      <p><strong>Shareholders Details:</strong> {formatData(customer.shareholdersDetailsUrl)}</p>
                      <p><strong>Credit Profile:</strong> {formatData(customer.creditProfileUrl)}</p>
                      <p><strong>Transaction Profile:</strong> {formatData(customer.transactionProfileUrl)}</p>
                      <p><strong>Collateral Profile:</strong> {formatData(customer.collateralProfileUrl)}</p>
                      <p><strong>Financial Profile:</strong> {formatData(customer.financialProfileUrl)}</p>
                    </div>
                  </div>

                  {/* Loan Analysis Section */}
                  {analysis && (
                    <div className="space-y-4 md:col-span-2">
                      <h3 className="font-semibold text-lg text-gray-700 mt-6">Loan Analysis</h3>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p><strong>PESTEL Analysis:</strong> {formatData(analysis.pestelAnalysisUrl)}</p>
                        <p><strong>SWOT Analysis:</strong> {formatData(analysis.swotAnalysisUrl)}</p>
                        <p><strong>Risk Assessment:</strong> {formatData(analysis.riskAssessmentUrl)}</p>
                        <p><strong>ESG Assessment:</strong> {formatData(analysis.esgAssessmentUrl)}</p>
                        <p><strong>Financial Need:</strong> {formatData(analysis.financialNeedUrl)}</p>
                        <div className="col-span-2">
                          <p><strong>Analyst Conclusion:</strong> {formatData(analysis.analystConclusion)}</p>
                        </div>
                        <div className="col-span-2">
                          <p><strong>Analyst Recommendation:</strong> {formatData(analysis.analystRecommendation)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Review Section */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="font-semibold text-lg text-gray-700 mt-6">Review & Scoring</h3>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <label htmlFor={`pestelanalysisScore-${customer.id}`} className="block text-sm font-medium text-gray-700">
                          PESTEL Analysis (0-100)
                        </label>
                        <input
                          id={`pestelanalysisScore-${customer.id}`}
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter score"
                          value={review.pestelanalysisScore ?? ''}
                          onChange={(e) => handleReviewChange(customer.applicationReferenceNumber, 'pestelanalysisScore', parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor={`swotanalysisScore-${customer.id}`} className="block text-sm font-medium text-gray-700">
                          SWOT Analysis (0-100)
                        </label>
                        <input
                          id={`swotanalysisScore-${customer.id}`}
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter score"
                          value={review.swotanalysisScore ?? ''}
                          onChange={(e) => handleReviewChange(customer.applicationReferenceNumber, 'swotanalysisScore', parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor={`riskassesmentScore-${customer.id}`} className="block text-sm font-medium text-gray-700">
                          Risk Assessment (0-100)
                        </label>
                        <input
                          id={`riskassesmentScore-${customer.id}`}
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter score"
                          value={review.riskassesmentScore ?? ''}
                          onChange={(e) => handleReviewChange(customer.applicationReferenceNumber, 'riskassesmentScore', parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor={`esgassesmentScore-${customer.id}`} className="block text-sm font-medium text-gray-700">
                          ESG Assessment (0-100)
                        </label>
                        <input
                          id={`esgassesmentScore-${customer.id}`}
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter score"
                          value={review.esgassesmentScore ?? ''}
                          onChange={(e) => handleReviewChange(customer.applicationReferenceNumber, 'esgassesmentScore', parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                           <div className="space-y-2">
                        <label htmlFor={`finacialneedScore-${customer.id}`} className="block text-sm font-medium text-gray-700">
                          Financial Need (0-100)
                        </label>
                        <input
                          id={`financialneedScore-${customer.id}`}
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter score"
                          value={review.financialneedScore ?? ''}
                          onChange={(e) => handleReviewChange(customer.applicationReferenceNumber, 'financialneedScore', parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor={`overallScore-${customer.id}`} className="block text-sm font-medium text-gray-700">
                          Overall Score
                        </label>
                        <input
                          id={`overallScore-${customer.id}`}
                          type="number"
                          value={review.overallScore || 0}
                          readOnly
                          className={`w-full p-2 border border-gray-300 rounded-md ${getScoreColor(review.overallScore || 0)}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor={`reviewNotes-${customer.id}`} className="block text-sm font-medium text-gray-700">
                        Review Notes
                      </label>
                      <textarea
                        id={`reviewNotes-${customer.id}`}
                        placeholder="Enter your review notes here..."
                        value={review.reviewNotes || ''}
                        onChange={(e) => handleReviewChange(customer.applicationReferenceNumber, 'reviewNotes', e.target.value)}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

               

                           <SaveReviewButton
                 customerId={customer.id}
                 refNumber={customer.applicationReferenceNumber}   // required for saveAnalysis
                reviewData={reviewData}                       // required for saveAnalysis
                 onSuccess={() => {
                   console.log("Analysis saved successfully");
                 }}
                 actionType="saveAnalysis"
               />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <Button 
                    onClick={() => fetchLoanAnalysis(customer.applicationReferenceNumber).then(() => {
                      toast.success('Analysis refreshed!');
                    })}
                    variant="outline"
                  >
                    Refresh Analysis
                  </Button>
                  {analysis ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Analysis Available
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      No Analysis
                    </Badge>
                  )}
             
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      <Toaster />
    </div>
  );
}
