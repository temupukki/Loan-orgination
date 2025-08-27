"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";

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

export default function CommitteeDecisionPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decisionReasons, setDecisionReasons] = useState<Record<string, string>>({});
  const [selectedDecisions, setSelectedDecisions] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchPendingCustomers = async () => {
      try {
        // Fix the status value - it should match your database enum
        const response = await fetch(`/api/get?status=COMMITTE_REVIEW`);        
        if (!response.ok) {
          throw new Error("Failed to fetch pending customers");
        }
        const data = await response.json();
        
        // Fetch loan analysis for each customer
        const customersWithAnalysis = await Promise.all(
          data.map(async (customer: Customer) => {
            try {
              const analysisResponse = await fetch(`/api/loan-analysis/${customer.applicationReferenceNumber}`);
              if (analysisResponse.ok) {
                const analysisData = await analysisResponse.json();
                return {
                  ...customer,
                  loanAnalysis: analysisData
                };
              }
              return {
                ...customer,
                loanAnalysis: null
              };
            } catch (err) {
              console.error(`Failed to fetch analysis for ${customer.applicationReferenceNumber}:`, err);
              return {
                ...customer,
                loanAnalysis: null
              };
            }
          })
        );
        
        setCustomers(customersWithAnalysis);
      } catch (err: any) {
        setError(err.message);
        toast.error("Failed to load applications");
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingCustomers();
  }, []);

  const handleDecision = async (customerId: string, applicationRef: string) => {
    const decision = selectedDecisions[applicationRef];
    
    if (!decision) {
      toast.error("Please select a decision");
      return;
    }

    // For rejected status, require a reason
    if (decision === 'REJECTED' && !decisionReasons[applicationRef]?.trim()) {
      toast.error("Please provide a decision reason for rejection");
      return;
    }

    setIsSubmitting(prev => ({ ...prev, [applicationRef]: true }));

    try {
      // First, update the customer status with PATCH
      const patchResponse = await fetch(`/api/customer/${customerId}/decision`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision,
          decisionReason: decisionReasons[applicationRef] || ''
        }),
      });

      const patchData = await patchResponse.json();

      if (!patchResponse.ok) {
        throw new Error(patchData.error || 'Failed to update application status');
      }

      // Remove the customer from the list
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      
      toast.success(`Decision submitted successfully`);
      
      // Clean up state
      setDecisionReasons(prev => {
        const newReasons = { ...prev };
        delete newReasons[applicationRef];
        return newReasons;
      });
      
      setSelectedDecisions(prev => {
        const newDecisions = { ...prev };
        delete newDecisions[applicationRef];
        return newDecisions;
      });

    } catch (err: any) {
      console.error("Error submitting decision:", err);
      toast.error(err.message || "Failed to submit decision");
    } finally {
      setIsSubmitting(prev => ({ ...prev, [applicationRef]: false }));
    }
  };

  const handleReasonChange = (applicationRef: string, reason: string) => {
    setDecisionReasons(prev => ({
      ...prev,
      [applicationRef]: reason
    }));
  };

  const handleDecisionChange = (applicationRef: string, decision: string) => {
    setSelectedDecisions(prev => ({
      ...prev,
      [applicationRef]: decision
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
      COMMITTE_REVERSED: { label: "Committe reversed", color: "bg-blue-100 text-blue-800" },
      COMMITTEE_REVIEW: { label: "Committee Review", color: "bg-purple-100 text-purple-800" },
      APPROVED: { label: "Approved", color: "bg-green-100 text-green-800" },
      REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] ||  
                  { label: status, color: "bg-gray-100 text-gray-800" };

    return <Badge className={config.color}>{config.label}</Badge>;
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-lg text-gray-600 mt-4">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 text-lg">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Committee Decisions 📋
        </h1>
        <p className="text-gray-600 mt-2">
          Review and make decisions on loan applications
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mt-4">
            All Caught Up! 🎉
          </h3>
          <p className="text-gray-600 mt-2">
            There are no applications pending committee review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="shadow-md">
              <CardHeader className="bg-blue-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">
                      {customer.firstName} {customer.middleName} {customer.lastName}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <span>Ref: {customer.applicationReferenceNumber}</span>
                        <span>Customer No: {customer.customerNumber}</span>
                      </div>
                    </CardDescription>
                  </div>
                  {getStatusBadge(customer.applicationStatus)}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-700">Personal Information</h3>
                    <Separator />
                    <p><strong>TIN:</strong> {formatData(customer.tinNumber)}</p>
                    <p><strong>National ID:</strong> {formatData(customer.nationalId)}</p>
                    <p><strong>Phone:</strong> {formatData(customer.phone)}</p>
                    <p><strong>Email:</strong> {formatData(customer.email)}</p>
                    <p><strong>Gender:</strong> {formatData(customer.gender)}</p>
                    <p><strong>Marital Status:</strong> {formatData(customer.maritalStatus)}</p>
                    <p><strong>Date of Birth:</strong> {formatData(new Date(customer.dateOfBirth).toLocaleDateString())}</p>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-700">Address Information</h3>
                    <Separator />
                    <p><strong>Region:</strong> {formatData(customer.region)}</p>
                    <p><strong>Zone:</strong> {formatData(customer.zone)}</p>
                    <p><strong>City:</strong> {formatData(customer.city)}</p>
                    <p><strong>Subcity:</strong> {formatData(customer.subcity)}</p>
                    <p><strong>Woreda:</strong> {formatData(customer.woreda)}</p>
                    <p><strong>Monthly Income:</strong> {formatData(customer.monthlyIncome)}</p>
                    <p><strong>Account Type:</strong> {formatData(customer.accountType)}</p>
                  </div>

                  {/* Business Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-700">Business Information</h3>
                    <Separator />
                    <p><strong>Major Line of Business:</strong> {formatData(customer.majorLineBusiness)}</p>
                    <p><strong>Date of Establishment (MLB):</strong> {formatData(new Date(customer.dateOfEstablishmentMLB).toLocaleDateString())}</p>
                    <p><strong>Economic Sector:</strong> {formatData(customer.economicSector)}</p>
                    <p><strong>Customer Segmentation:</strong> {formatData(customer.customerSegmentation)}</p>
                    <p><strong>Credit Initiation Center:</strong> {formatData(customer.creditInitiationCenter)}</p>
                  </div>

                  {/* Loan Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-700">Loan Details</h3>
                    <Separator />
                    <p><strong>Loan Type:</strong> {formatData(customer.loanType)}</p>
                    <p><strong>Loan Amount:</strong> {formatData(customer.loanAmount)}</p>
                    <p><strong>Loan Period:</strong> {formatData(customer.loanPeriod)} months</p>
                    <p><strong>Mode of Repayment:</strong> {formatData(customer.modeOfRepayment)}</p>
                    <p><strong>Purpose of Loan:</strong> {formatData(customer.purposeOfLoan)}</p>
                  </div>

                  {/* Documents */}
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

                  {/* Loan Analysis */}
                  {customer.loanAnalysis && (
                    <div className="space-y-4 md:col-span-2">
                      <h3 className="font-semibold text-lg text-gray-700">Loan Analysis</h3>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p><strong>Financial Profile:</strong> {formatData(customer.loanAnalysis.financialProfileUrl)}</p>
                        <p><strong>PESTEL Analysis:</strong> {formatData(customer.loanAnalysis.pestelAnalysisUrl)}</p>
                        <p><strong>SWOT Analysis:</strong> {formatData(customer.loanAnalysis.swotAnalysisUrl)}</p>
                        <p><strong>Risk Assessment:</strong> {formatData(customer.loanAnalysis.riskAssessmentUrl)}</p>
                        <p><strong>ESG Assessment:</strong> {formatData(customer.loanAnalysis.esgAssessmentUrl)}</p>
                        <p><strong>Financial Need:</strong> {formatData(customer.loanAnalysis.financialNeedUrl)}</p>
                        
                        {customer.loanAnalysis.analystConclusion && (
                          <div className="col-span-2">
                            <p><strong>Analyst Conclusion:</strong></p>
                            <p className="mt-1 p-3 bg-gray-100 rounded-md">{customer.loanAnalysis.analystConclusion}</p>
                          </div>
                        )}
                        
                        {customer.loanAnalysis.analystRecommendation && (
                          <div className="col-span-2">
                            <p><strong>Analyst Recommendation:</strong></p>
                            <p className="mt-1 p-3 bg-gray-100 rounded-md">{customer.loanAnalysis.analystRecommendation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Decision Section */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Committee Decision:</h4>
                  <div className="flex flex-col space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`decision-${customer.applicationReferenceNumber}`}
                        value="APPROVED"
                        checked={selectedDecisions[customer.applicationReferenceNumber] === 'APPROVED'}
                        onChange={(e) => handleDecisionChange(customer.applicationReferenceNumber, e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-gray-700">Approve</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`decision-${customer.applicationReferenceNumber}`}
                        value="COMMITTE_REVERSED"
                        checked={selectedDecisions[customer.applicationReferenceNumber] === 'COMMITTE_REVERSED'}
                        onChange={(e) => handleDecisionChange(customer.applicationReferenceNumber, e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-gray-700">Need More Review</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`decision-${customer.applicationReferenceNumber}`}
                        value="REJECTED"
                        checked={selectedDecisions[customer.applicationReferenceNumber] === 'REJECTED'}
                        onChange={(e) => handleDecisionChange(customer.applicationReferenceNumber, e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-gray-700">Reject</span>
                    </label>
                  </div>

                  {selectedDecisions[customer.applicationReferenceNumber] === 'REJECTED' && (
                    <div className="space-y-2 mt-4">
                      <h4 className="font-semibold">Decision Reason (Required):</h4>
                      <textarea
                        placeholder="Enter detailed reason for rejecting this application..."
                        value={decisionReasons[customer.applicationReferenceNumber] || ''}
                        onChange={(e) => handleReasonChange(customer.applicationReferenceNumber, e.target.value)}
                        className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                        required
                      />
                      <p className="text-sm text-gray-500">Please provide a detailed reason for rejection.</p>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="bg-gray-50 flex justify-between items-center p-4">
                <div className="text-sm text-gray-600">
                  Application ready for committee decision
                </div>
                <Button
                  onClick={() => handleDecision(customer.id, customer.applicationReferenceNumber)}
                  disabled={isSubmitting[customer.applicationReferenceNumber]}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting[customer.applicationReferenceNumber] ? 'Processing...' : 'Submit Decision'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <Toaster />
    </div>
  );
}