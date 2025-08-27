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
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  IdCard,
  Building,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  BarChart3,
  ClipboardList,
  Check,
  X,
  RotateCcw
} from "lucide-react";

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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPendingCustomers();
  }, []);

  const fetchPendingCustomers = async () => {
    try {
      setRefreshing(true);
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
      setError(null);
    } catch (err: any) {
      setError(err.message || "We're having trouble connecting to the server. Please try again in a moment.");
      setCustomers([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

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
      PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      COMMITTE_REVERSED: { label: "Committe reversed", color: "bg-blue-100 text-blue-800 border-blue-200" },
      COMMITTEE_REVIEW: { label: "Committee Review", color: "bg-purple-100 text-purple-800 border-purple-200" },
      APPROVED: { label: "Approved", color: "bg-green-100 text-green-800 border-green-200" },
      REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800 border-red-200" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] ||  
                  { label: status, color: "bg-gray-100 text-gray-800 border-gray-200" };

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatData = (value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === "") {
      return <span className="text-gray-400">N/A</span>;
    }
    if (typeof value === 'string' && value.startsWith('http')) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-1"
        >
          <FileText size={14} />
          View Document
        </a>
      );
    }
    if (typeof value === 'number' && value > 1000) {
      return new Intl.NumberFormat('en-ET', {
        style: 'currency',
        currency: 'ETB'
      }).format(value);
    }
    return value;
  };

  const CardSkeleton = () => (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200 py-4">
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-6 w-full" />
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-48 mb-2" />
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex justify-between items-center text-sm">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="bg-gray-50 border-t border-gray-200 flex justify-end py-4">
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-80" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-2">
          Committee Decisions 📋
        </h1>
        <p className="text-gray-600 text-center max-w-2xl">
          Review and make decisions on loan applications awaiting committee review.
        </p>
        
        <div className="flex gap-4 mt-6">
          <Button
            onClick={fetchPendingCustomers}
            variant="outline"
            className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Applications"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto border-4 border-dashed border-gray-200 text-gray-700 mb-8">
          <div className="mb-6 p-4 bg-red-100 rounded-full">
            <AlertCircle className="text-red-500" size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">All Clear!</h2>
          <p className="text-lg text-gray-600 text-center mb-6 max-w-md">
             No applications pending committee review. Check back later for new submissions.
          </p>
          <Button
            onClick={fetchPendingCustomers}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
            size="sm"
          >
            <RefreshCw size={14} />
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !error && customers.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto border-4 border-dashed border-gray-200">
          <div className="mb-6 p-4 bg-green-100 rounded-full">
            <CheckCircle2 className="text-green-600" size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">All Clear!</h2>
          <p className="text-lg text-gray-600 text-center mb-6 max-w-md">
            No applications pending committee review. Check back later for new submissions.
          </p>
          <Button
            onClick={fetchPendingCustomers}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <RefreshCw size={18} />
            Check for New Applications
          </Button>
        </div>
      )}

      {!isLoading && customers.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="max-w-6xl mx-auto overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-4 px-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 flex items-center gap-2 font-extrabold">
                      <User size={24} className="text-blue-600" />
                      {customer.firstName} {customer.middleName} {customer.lastName}
                    </CardTitle>
                    <CardDescription className="flex flex-col md:flex-row md:gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <IdCard size={14} />
                        Ref: <span className="font-medium text-gray-800">{customer.applicationReferenceNumber}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Building size={14} />
                        Customer No: <span className="font-medium text-gray-800">{customer.customerNumber}</span>
                      </span>
                    </CardDescription>
                  </div>
                  {getStatusBadge(customer.applicationStatus)}
                </div>
              </CardHeader>

              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                    <User size={18} className="text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">TIN:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.tinNumber)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">National ID:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.nationalId)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600 flex items-center gap-1">
                        <Phone size={14} />
                        Phone:
                      </p>
                      <p className="font-medium text-gray-800">{formatData(customer.phone)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600 flex items-center gap-1">
                        <Mail size={14} />
                        Email:
                      </p>
                      <p className="font-medium text-gray-800">{formatData(customer.email)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">Gender:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.gender)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">Marital Status:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.maritalStatus)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600 flex items-center gap-1">
                        <Calendar size={14} />
                        Date of Birth:
                      </p>
                      <p className="font-medium text-gray-800">{formatData(new Date(customer.dateOfBirth).toLocaleDateString())}</p>
                    </div>
                  </div>
                </div>

                {/* Address & Income */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                    <MapPin size={18} className="text-blue-600" />
                    Address & Income
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">Region:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.region)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">Zone:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.zone)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">City:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.city)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">Subcity:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.subcity)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">Woreda:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.woreda)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600 flex items-center gap-1">
                        <DollarSign size={14} />
                        Monthly Income:
                      </p>
                      <p className="font-medium text-gray-800">{formatData(customer.monthlyIncome)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">Account Type:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.accountType)}</p>
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                    <Briefcase size={18} className="text-blue-600" />
                    Business Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">Major Business:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.majorLineBusiness)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600 flex items-center gap-1">
                        <Calendar size={14} />
                        Established:
                      </p>
                      <p className="font-medium text-gray-800">{formatData(new Date(customer.dateOfEstablishmentMLB).toLocaleDateString())}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">Economic Sector:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.economicSector)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">Customer Segment:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.customerSegmentation)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">Initiation Center:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.creditInitiationCenter)}</p>
                    </div>
                  </div>
                </div>

                {/* Loan Details */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                    <DollarSign size={18} className="text-blue-600" />
                    Loan Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">Loan Type:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.loanType)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">Loan Amount:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.loanAmount)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">Loan Period:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.loanPeriod)} months</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">Repayment Mode:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.modeOfRepayment)}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-600">Purpose:</p>
                      <p className="font-medium text-gray-800">{formatData(customer.purposeOfLoan)}</p>
                    </div>
                  </div>
                </div>

                {/* Supporting Documents */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" />
                    Supporting Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">National ID:</span>
                      {formatData(customer.nationalidUrl)}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Agreement Form:</span>
                      {formatData(customer.agreementFormUrl)}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Major Business Doc:</span>
                      {formatData(customer.majorLineBusinessUrl)}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Application Form:</span>
                      {formatData(customer.applicationFormUrl)}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Shareholders Details:</span>
                      {formatData(customer.shareholdersDetailsUrl)}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Credit Profile:</span>
                      {formatData(customer.creditProfileUrl)}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Transaction Profile:</span>
                      {formatData(customer.transactionProfileUrl)}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Collateral Profile:</span>
                      {formatData(customer.collateralProfileUrl)}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Financial Profile:</span>
                      {formatData(customer.financialProfileUrl)}
                    </div>
                  </div>
                </div>

                {/* Loan Analysis Section */}
                {customer.loanAnalysis && (
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                      <BarChart3 size={18} className="text-blue-600" />
                      Loan Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Financial Profile:</span>
                        {formatData(customer.loanAnalysis.financialProfileUrl)}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">PESTEL Analysis:</span>
                        {formatData(customer.loanAnalysis.pestelAnalysisUrl)}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">SWOT Analysis:</span>
                        {formatData(customer.loanAnalysis.swotAnalysisUrl)}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Risk Assessment:</span>
                        {formatData(customer.loanAnalysis.riskAssessmentUrl)}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">ESG Assessment:</span>
                        {formatData(customer.loanAnalysis.esgAssessmentUrl)}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Financial Need:</span>
                        {formatData(customer.loanAnalysis.financialNeedUrl)}
                      </div>
                      
                      {customer.loanAnalysis.analystConclusion && (
                        <div className="col-span-2">
                          <div className="flex flex-col text-sm">
                            <span className="text-gray-600 mb-1">Analyst Conclusion:</span>
                            <span className="font-medium text-gray-800 bg-blue-50 p-3 rounded-md">{formatData(customer.loanAnalysis.analystConclusion)}</span>
                          </div>
                        </div>
                      )}
                      
                      {customer.loanAnalysis.analystRecommendation && (
                        <div className="col-span-2">
                          <div className="flex flex-col text-sm">
                            <span className="text-gray-600 mb-1">Analyst Recommendation:</span>
                            <span className="font-medium text-gray-800 bg-blue-50 p-3 rounded-md">{formatData(customer.loanAnalysis.analystRecommendation)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Decision Section */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                    <ClipboardList size={18} className="text-blue-600" />
                    Committee Decision
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={`decision-${customer.applicationReferenceNumber}`}
                          value="APPROVED"
                          checked={selectedDecisions[customer.applicationReferenceNumber] === 'APPROVED'}
                          onChange={(e) => handleDecisionChange(customer.applicationReferenceNumber, e.target.value)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-600" />
                          <span className="text-gray-700 font-medium">Approve</span>
                        </div>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={`decision-${customer.applicationReferenceNumber}`}
                          value="COMMITTE_REVERSED"
                          checked={selectedDecisions[customer.applicationReferenceNumber] === 'COMMITTE_REVERSED'}
                          onChange={(e) => handleDecisionChange(customer.applicationReferenceNumber, e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-2">
                          <RotateCcw className="h-5 w-5 text-blue-600" />
                          <span className="text-gray-700 font-medium">Need Review</span>
                        </div>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={`decision-${customer.applicationReferenceNumber}`}
                          value="REJECTED"
                          checked={selectedDecisions[customer.applicationReferenceNumber] === 'REJECTED'}
                          onChange={(e) => handleDecisionChange(customer.applicationReferenceNumber, e.target.value)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500"
                        />
                        <div className="flex items-center gap-2">
                          <X className="h-5 w-5 text-red-600" />
                          <span className="text-gray-700 font-medium">Reject</span>
                        </div>
                      </label>
                    </div>

                    {selectedDecisions[customer.applicationReferenceNumber] === 'REJECTED' || selectedDecisions[customer.applicationReferenceNumber] === 'COMMITTE_REVERSED' && (
                      <div className="col-span-3 space-y-2 mt-4">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                          <AlertCircle size={16} className="text-red-500" />
                          Decision Reason (Required):
                        </h4>
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
                </div>
              </CardContent>

              <CardFooter className="bg-gray-50 border-t border-gray-200 flex justify-between items-center py-4 px-6">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock size={14} />
                  Application ready for committee decision
                </div>
                <Button
                  onClick={() => handleDecision(customer.id, customer.applicationReferenceNumber)}
                  disabled={isSubmitting[customer.applicationReferenceNumber]}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting[customer.applicationReferenceNumber] ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Submit Decision
                    </>
                  )}
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