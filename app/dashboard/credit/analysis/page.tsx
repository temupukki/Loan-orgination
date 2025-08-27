// pages/pending-customers.tsx
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TakeButton } from '@/components/TakeButton';
import { Button } from "@/components/ui/button";
import { toast, Toaster } from 'sonner';

// Import Supabase client from your library
import { supabase } from '@/lib/supabase';
import { SaveButton } from '@/components/SaveButton';

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
  loanAnalysis: LoanAnalysis | null; // The new field with the related data
}

export default function PendingCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<Record<string, Partial<LoanAnalysis>>>({});

  // Function to handle the file upload to Supabase Storage
  const uploadFile = async (file: File, path: string) => {
    if (!file) {
      throw new Error("No file selected for upload.");
    }
    
    const { data, error } = await supabase.storage
      .from('LOAN')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload file.');
    }

    const { data: publicUrlData } = supabase.storage
      .from('LOAN')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  };

  useEffect(() => {
    const fetchPendingCustomers = async () => {
      try {
        const response = await fetch(`/api/credit?status=UNDER_REVIEW`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch pending customers');
        }
        const data = await response.json();
        setCustomers(data);
        
        const initialAnalysisData = data.reduce((acc: any, customer: Customer) => {
          acc[customer.applicationReferenceNumber] = customer.loanAnalysis || {};
          return acc;
        }, {});
        setAnalysisData(initialAnalysisData);

      } catch (err: any) {
        setError(err.message);
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingCustomers();
  }, []);

  const handleInputChange = (refNumber: string, field: keyof LoanAnalysis, value: string) => {
    setAnalysisData(prev => ({
      ...prev,
      [refNumber]: {
        ...prev[refNumber],
        [field]: value,
      },
    }));
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, refNumber: string, field: keyof LoanAnalysis) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading(`Uploading ${file.name}...`);
      const filePath = `loan-analysis/${refNumber}/${field}-${file.name}`;
      const url = await uploadFile(file, filePath);
      
      toast.dismiss();
      toast.success("File uploaded successfully!");
      
      setAnalysisData(prev => ({
        ...prev,
        [refNumber]: {
          ...prev[refNumber],
          [field]: url,
        },
      }));

    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'An unexpected error occurred during file upload.');
    }
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
  
  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
        Pending Applications ⏳
      </h1>

      {isLoading && <div className="text-center text-lg text-gray-600">Fetching pending applications...</div>}
      {error && <div className="text-center text-red-600 text-lg p-4 bg-red-100 rounded-lg">Error: {error}</div>}

      {!isLoading && !error && customers.length === 0 && (
        <div className="text-center text-lg text-gray-500 p-4 bg-white rounded-lg shadow-md">
          <p>There are no pending applications at the moment. 🎉</p>
        </div>
      )}

      {!isLoading && customers.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="max-w-4xl mx-auto">
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

                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-semibold text-lg text-gray-700 mt-6">Loan Analysis & Recommendation</h3>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Document Uploads for Analysis */}
                 

                    <div className="space-y-2">
                      <label htmlFor={`pestelAnalysisUrl-${customer.id}`} className="text-sm font-medium">PESTEL Analysis Doc</label>
                      <input 
                        id={`pestelAnalysisUrl-${customer.id}`}
                        type="file" 
                        onChange={(e) => handleFileUpload(e, customer.applicationReferenceNumber, 'pestelAnalysisUrl')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">{analysisData[customer.applicationReferenceNumber]?.pestelAnalysisUrl || 'No file uploaded'}</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor={`swotAnalysisUrl-${customer.id}`} className="text-sm font-medium">SWOT Analysis Doc</label>
                      <input 
                        id={`swotAnalysisUrl-${customer.id}`}
                        type="file" 
                        onChange={(e) => handleFileUpload(e, customer.applicationReferenceNumber, 'swotAnalysisUrl')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">{analysisData[customer.applicationReferenceNumber]?.swotAnalysisUrl || 'No file uploaded'}</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor={`riskAssessmentUrl-${customer.id}`} className="text-sm font-medium">Risk Assessment Doc</label>
                      <input 
                        id={`riskAssessmentUrl-${customer.id}`}
                        type="file" 
                        onChange={(e) => handleFileUpload(e, customer.applicationReferenceNumber, 'riskAssessmentUrl')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">{analysisData[customer.applicationReferenceNumber]?.riskAssessmentUrl || 'No file uploaded'}</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor={`esgAssessmentUrl-${customer.id}`} className="text-sm font-medium">ESG Assessment Doc</label>
                      <input 
                        id={`esgAssessmentUrl-${customer.id}`}
                        type="file" 
                        onChange={(e) => handleFileUpload(e, customer.applicationReferenceNumber, 'esgAssessmentUrl')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">{analysisData[customer.applicationReferenceNumber]?.esgAssessmentUrl || 'No file uploaded'}</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor={`financialNeedUrl-${customer.id}`} className="text-sm font-medium">Financial Need Doc</label>
                      <input 
                        id={`financialNeedUrl-${customer.id}`}
                        type="file" 
                        onChange={(e) => handleFileUpload(e, customer.applicationReferenceNumber, 'financialNeedUrl')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">{analysisData[customer.applicationReferenceNumber]?.financialNeedUrl || 'No file uploaded'}</p>
                    </div>

                    {/* Input fields for analyst's text */}
                    <div className="col-span-2 space-y-2">
                      <label htmlFor={`analystConclusion-${customer.id}`} className="text-sm font-medium">Analyst Conclusion</label>
                      <textarea
                        id={`analystConclusion-${customer.id}`}
                        placeholder="Enter analyst's conclusion here..."
                        value={analysisData[customer.applicationReferenceNumber]?.analystConclusion || ''}
                        onChange={(e) => handleInputChange(customer.applicationReferenceNumber, 'analystConclusion', e.target.value)}
                        rows={4}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <label htmlFor={`analystRecommendation-${customer.id}`} className="text-sm font-medium">Analyst Recommendation</label>
                      <textarea
                        id={`analystRecommendation-${customer.id}`}
                        placeholder="Enter analyst's recommendation here..."
                        value={analysisData[customer.applicationReferenceNumber]?.analystRecommendation || ''}
                        onChange={(e) => handleInputChange(customer.applicationReferenceNumber, 'analystRecommendation', e.target.value)}
                        rows={4}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
              
            <SaveButton
  customerId={customer.id}
  refNumber={customer.applicationReferenceNumber}   // required for saveAnalysis
  analysisData={analysisData}                       // required for saveAnalysis
  onSuccess={() => {
    console.log("Analysis saved successfully");
  }}
  actionType="saveAnalysis"
/>
        
                   </CardFooter>

            </Card>
          ))}
        </div>
      )}
      <Toaster />
    </div>
  );
}