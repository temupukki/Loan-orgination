'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from 'sonner';
import { CreditEdit } from '@/components/CreditEdit';
import { CreditFinish } from '@/components/CreditFinish';

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
  financialneedScore?: number;
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

  useEffect(() => {
    const fetchPendingCustomers = async () => {
      try {
        const response = await fetch(`/api/revised?status=SUPERVISED`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch pending customers');
        }
        const data = await response.json();
        setCustomers(data);
        
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

  const fetchAllLoanAnalyses = async (customersData: Customer[]) => {
    try {
      const analyses: Record<string, LoanAnalysis> = {};
      
      for (const customer of customersData) {
        const analysis = await fetchLoanAnalysis(customer.applicationReferenceNumber);
        if (analysis) {
          analyses[customer.applicationReferenceNumber] = analysis;
        }
      }
      
      setLoanAnalyses(analyses);
    } catch (err: any) {
      console.error('Error fetching loan analyses:', err);
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

  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) {
      return 'text-gray-500';
    }
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score?: number) => {
    if (score === undefined || score === null) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-700">N/A</Badge>;
    }
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">{score}</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">{score}</Badge>;
    return <Badge className="bg-red-100 text-red-800">{score}</Badge>;
  };

  const getOverallScoreBadge = (score?: number) => {
    if (score === undefined || score === null) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-700 text-lg px-4 py-2">Overall: N/A</Badge>;
    }
    if (score >= 80) return <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">Overall: {score}</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800 text-lg px-4 py-2">Overall: {score}</Badge>;
    return <Badge className="bg-red-100 text-red-800 text-lg px-4 py-2">Overall: {score}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Supervised Applications 📋
          </h1>
          <p className="text-gray-600 mt-2">Review and monitor customer loan applications</p>
        </div>
        <Button onClick={handleRefreshAnalyses} variant="outline" className="gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Refresh Analyses
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-lg text-gray-600 mt-4">Fetching pending applications...</p>
        </div>
      )}
      
      {error && (
        <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 text-lg mt-2">Error: {error}</p>
        </div>
      )}

      {!isLoading && !error && customers.length === 0 && (
        <div className="text-center p-12 bg-white rounded-lg shadow-sm border">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mt-4">All Caught Up! 🎉</h3>
          <p className="text-gray-600 mt-2">There are no supervised applications at the moment.</p>
        </div>
      )}

      {!isLoading && customers.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {customers.map((customer) => {
            const analysis = loanAnalyses[customer.applicationReferenceNumber];
            
            return (
              <Card key={customer.id} className="max-w-6xl mx-auto shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-gray-900">
                        {customer.firstName} {customer.middleName} {customer.lastName}
                      </CardTitle>
                      <CardDescription className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 gap-2">
                        <span className="text-sm font-medium">Ref: {customer.applicationReferenceNumber}</span>
                        <span className="text-sm">Customer No: {customer.customerNumber}</span>
                      </CardDescription>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1 text-sm">
                      {customer.applicationStatus}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Personal Information
                      </h3>
                      <Separator />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><strong className="text-gray-700">TIN:</strong> {formatData(customer.tinNumber)}</div>
                        <div><strong className="text-gray-700">National ID:</strong> {formatData(customer.nationalId)}</div>
                        <div><strong className="text-gray-700">Phone:</strong> {formatData(customer.phone)}</div>
                        <div><strong className="text-gray-700">Email:</strong> {formatData(customer.email)}</div>
                        <div><strong className="text-gray-700">Gender:</strong> {formatData(customer.gender)}</div>
                        <div><strong className="text-gray-700">Status:</strong> {formatData(customer.maritalStatus)}</div>
                        <div><strong className="text-gray-700">DOB:</strong> {formatData(new Date(customer.dateOfBirth).toLocaleDateString())}</div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Address & Income
                      </h3>
                      <Separator />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><strong className="text-gray-700">Region:</strong> {formatData(customer.region)}</div>
                        <div><strong className="text-gray-700">Zone:</strong> {formatData(customer.zone)}</div>
                        <div><strong className="text-gray-700">City:</strong> {formatData(customer.city)}</div>
                        <div><strong className="text-gray-700">Subcity:</strong> {formatData(customer.subcity)}</div>
                        <div><strong className="text-gray-700">Woreda:</strong> {formatData(customer.woreda)}</div>
                        <div><strong className="text-gray-700">Income:</strong> ETB {formatData(customer.monthlyIncome?.toLocaleString())}</div>
                        <div><strong className="text-gray-700">Account Type:</strong> {formatData(customer.accountType)}</div>
                      </div>
                    </div>

                    {/* Business Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                        Business Details
                      </h3>
                      <Separator />
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div><strong className="text-gray-700">Business:</strong> {formatData(customer.majorLineBusiness)}</div>
                        <div><strong className="text-gray-700">Established:</strong> {formatData(new Date(customer.dateOfEstablishmentMLB).toLocaleDateString())}</div>
                        <div><strong className="text-gray-700">Sector:</strong> {formatData(customer.economicSector)}</div>
                        <div><strong className="text-gray-700">Segment:</strong> {formatData(customer.customerSegmentation)}</div>
                        <div><strong className="text-gray-700">Center:</strong> {formatData(customer.creditInitiationCenter)}</div>
                      </div>
                    </div>

                    {/* Loan Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                        Loan Details
                      </h3>
                      <Separator />
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div><strong className="text-gray-700">Type:</strong> {formatData(customer.loanType)}</div>
                        <div><strong className="text-gray-700">Amount:</strong> ETB {formatData(customer.loanAmount?.toLocaleString())}</div>
                        <div><strong className="text-gray-700">Period:</strong> {formatData(customer.loanPeriod)} months</div>
                        <div><strong className="text-gray-700">Repayment:</strong> {formatData(customer.modeOfRepayment)}</div>
                        <div><strong className="text-gray-700">Purpose:</strong> {formatData(customer.purposeOfLoan)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="mt-6 space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      Documents
                    </h3>
                    <Separator />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                      {[
                        { label: 'National ID', value: customer.nationalidUrl },
                        { label: 'Agreement Form', value: customer.agreementFormUrl },
                        { label: 'Business Doc', value: customer.majorLineBusinessUrl },
                        { label: 'Application Form', value: customer.applicationFormUrl },
                        { label: 'Shareholders', value: customer.shareholdersDetailsUrl },
                        { label: 'Credit Profile', value: customer.creditProfileUrl },
                        { label: 'Transaction', value: customer.transactionProfileUrl },
                        { label: 'Collateral', value: customer.collateralProfileUrl },
                        { label: 'Financial', value: customer.financialProfileUrl },
                      ].map((doc, index) => (
                        <div key={index} className="flex flex-col">
                          <strong className="text-gray-700 text-xs">{doc.label}:</strong>
                          <span className="text-xs">{formatData(doc.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Loan Analysis Section */}
                  {analysis && (
                    <div className="mt-6 space-y-4">
                      <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Loan Analysis
                      </h3>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {[
                          { label: 'PESTEL Analysis', value: analysis.pestelAnalysisUrl },
                          { label: 'SWOT Analysis', value: analysis.swotAnalysisUrl },
                          { label: 'Risk Assessment', value: analysis.riskAssessmentUrl },
                          { label: 'ESG Assessment', value: analysis.esgAssessmentUrl },
                          { label: 'Financial Need', value: analysis.financialNeedUrl },
                        ].map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <strong className="text-gray-700">{item.label}:</strong>
                            <span>{formatData(item.value)}</span>
                          </div>
                        ))}
                        <div className="md:col-span-2">
                          <strong className="text-gray-700">Analyst Conclusion:</strong>
                          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded">{formatData(analysis.analystConclusion)}</p>
                        </div>
                        <div className="md:col-span-2">
                          <strong className="text-gray-700">Analyst Recommendation:</strong>
                          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded">{formatData(analysis.analystRecommendation)}</p>
                        </div>
                          <div className="md:col-span-2">
                          <strong className="text-gray-700">Supervisor Comment:</strong>
                          <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded">{formatData(analysis.reviewNotes)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Review Scores Section */}
                  <div className="mt-6 space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Review Scores
                    </h3>
                    <Separator />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {[
                        { label: 'PESTEL', score: analysis?.pestelanalysisScore },
                        { label: 'SWOT', score: analysis?.swotanalysisScore },
                        { label: 'Risk', score: analysis?.riskassesmentScore },
                        { label: 'ESG', score: analysis?.esgassesmentScore },
                        { label: 'Financial Need', score: analysis?.financialneedScore },
                      ].map((item, index) => (
                        <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-2">{item.label}</p>
                          {getScoreBadge(item.score)}
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center mt-4 p-4 bg-blue-50 rounded-lg">
                      {getOverallScoreBadge(analysis?.overallScore)}
                    </div>
                  </div>
                </CardContent>
                 <CreditEdit
                    customerId={customer.id} 
                    onSuccess={() => {
                      // Optional: refresh the page, refetch customer, or show a toast
                      console.log("Customer assigned successfully");
                    }} 
                  />
                    <CreditFinish
                    customerId={customer.id} 
                    onSuccess={() => {
                      // Optional: refresh the page, refetch customer, or show a toast
                      console.log("Customer assigned successfully");
                    }} 
                  />
                
                <CardFooter className="bg-gray-50 flex justify-between items-center p-4">

                  <Button 
                    onClick={() => fetchLoanAnalysis(customer.applicationReferenceNumber).then(() => {
                      toast.success('Analysis refreshed!');
                    })}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Refresh Analysis
                  </Button>
                  
                  {analysis ? (
                    <Badge className="bg-green-100 text-green-800 px-3 py-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Analysis Complete
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-700 px-3 py-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v3.586L7.707 7.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 8.586V5z" clipRule="evenodd" />
                      </svg>
                      Pending Analysis
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