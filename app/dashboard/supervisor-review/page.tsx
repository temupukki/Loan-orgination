"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import { Takesup } from "@/components/Takesup";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  FileText,
  User,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  IdCard,
  Building,
  CheckCircle2,
  Info,
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
}

export default function PendingCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loanAnalyses, setLoanAnalyses] = useState<
    Record<string, LoanAnalysis>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPendingCustomers = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/get?status=CONDITIONAL`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch available customers"
        );
      }
      const data = await response.json();
      setCustomers(data);

      // fetch loan analyses for all customers
      await fetchAllLoanAnalyses(data);
      setError(null);
    } catch (err: any) {
      setError(
        "We're having trouble connecting to the server. Please try again in a moment."
      );
      setCustomers([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLoanAnalysis = async (applicationReferenceNumber: string) => {
    try {
      const response = await fetch(
        `/api/loan-analysis/${applicationReferenceNumber}`
      );
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch {
      return null;
    }
  };

  const fetchAllLoanAnalyses = async (customersData: Customer[]) => {
    const analyses: Record<string, LoanAnalysis> = {};
    for (const customer of customersData) {
      const analysis = await fetchLoanAnalysis(
        customer.applicationReferenceNumber
      );
      if (analysis) {
        analyses[customer.applicationReferenceNumber] = analysis;
      }
    }
    setLoanAnalyses(analyses);
  };

  useEffect(() => {
    fetchPendingCustomers();
  }, []);

  const formatData = (value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === "") {
      return <span className="text-gray-400">N/A</span>;
    }
    if (typeof value === "string" && value.startsWith("http")) {
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
    if (typeof value === "number" && value > 1000) {
      return new Intl.NumberFormat("en-ET", {
        style: "currency",
        currency: "ETB",
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
                <div
                  key={j}
                  className="flex justify-between items-center text-sm"
                >
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
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-2">
          Available Applications
        </h1>
      

        <div className="flex gap-4 mt-6">
          <Button
            onClick={fetchPendingCustomers}
            variant="outline"
            className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh List"}
          </Button>
       
        </div>
      </div>

      {error && (
        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto border-4 border-dashed border-gray-200 text-gray-700 mb-8">
          <div className="mb-6 p-4 bg-green-100 rounded-full">
             <CheckCircle2 className="text-green-600" size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
             All Clear!
          </h2>
          <p className="text-lg text-gray-600 text-center mb-6 max-w-md">
               All applications have been taken. Feel free to check back later!
          </p>
          <Button
            onClick={fetchPendingCustomers}
            className="gap-2 bg-red-600 hover:bg-gray-700 text-white"
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
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            All Clear!
          </h2>
          <p className="text-lg text-gray-600 text-center mb-6 max-w-md">
          
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
          {customers.map((customer) => {
            const analysis = loanAnalyses[customer.applicationReferenceNumber];
            return (
              <Card
                key={customer.id}
                className="max-w-6xl mx-auto overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-4 px-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl text-gray-900 flex items-center gap-2 font-extrabold">
                        <User size={24} className="text-blue-600" />
                        {customer.firstName} {customer.middleName}{" "}
                        {customer.lastName}
                      </CardTitle>
                      <CardDescription className="flex flex-col md:flex-row md:gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <IdCard size={14} />
                          Ref:{" "}
                          <span className="font-medium text-gray-800">
                            {customer.applicationReferenceNumber}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Building size={14} />
                          Customer No:{" "}
                          <span className="font-medium text-gray-800">
                            {customer.customerNumber}
                          </span>
                        </span>
                      </CardDescription>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 border-yellow-200 self-start md:self-auto py-1 px-3 font-semibold text-sm"
                    >
                      {customer.applicationStatus}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                      <User size={18} className="text-blue-600" />
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">TIN:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.tinNumber)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">National ID:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.nationalId)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600 flex items-center gap-1">
                          <Phone size={14} />
                          Phone:
                        </p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.phone)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600 flex items-center gap-1">
                          <Mail size={14} />
                          Email:
                        </p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.email)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">Gender:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.gender)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">Marital Status:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.maritalStatus)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600 flex items-center gap-1">
                          <Calendar size={14} />
                          Date of Birth:
                        </p>
                        <p className="font-medium text-gray-800">
                          {formatData(
                            new Date(customer.dateOfBirth).toLocaleDateString()
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                      <MapPin size={18} className="text-blue-600" />
                      Address & Income
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">Region:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.region)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">Zone:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.zone)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">City:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.city)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">Subcity:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.subcity)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">Woreda:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.woreda)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600 flex items-center gap-1">
                          <DollarSign size={14} />
                          Monthly Income:
                        </p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.monthlyIncome)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">Account Type:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.accountType)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                      <Briefcase size={18} className="text-blue-600" />
                      Business Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">Major Business:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.majorLineBusiness)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600 flex items-center gap-1">
                          <Calendar size={14} />
                          Established:
                        </p>
                        <p className="font-medium text-gray-800">
                          {formatData(
                            new Date(
                              customer.dateOfEstablishmentMLB
                            ).toLocaleDateString()
                          )}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">Economic Sector:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.economicSector)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">Customer Segment:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.customerSegmentation)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">Initiation Center:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.creditInitiationCenter)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                      <DollarSign size={18} className="text-blue-600" />
                      Loan Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">Loan Type:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.loanType)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">Loan Amount:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.loanAmount)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">Loan Period:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.loanPeriod)} months
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">Repayment Mode:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.modeOfRepayment)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">Purpose:</p>
                        <p className="font-medium text-gray-800">
                          {formatData(customer.purposeOfLoan)}
                        </p>
                      </div>
                    </div>
                  </div>

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
                        <span className="text-gray-600">
                          Major Business Doc:
                        </span>
                        {formatData(customer.majorLineBusinessUrl)}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Application Form:</span>
                        {formatData(customer.applicationFormUrl)}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          Shareholders Details:
                        </span>
                        {formatData(customer.shareholdersDetailsUrl)}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Credit Profile:</span>
                        {formatData(customer.creditProfileUrl)}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          Transaction Profile:
                        </span>
                        {formatData(customer.transactionProfileUrl)}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          Collateral Profile:
                        </span>
                        {formatData(customer.collateralProfileUrl)}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          Financial Profile:
                        </span>
                        {formatData(customer.financialProfileUrl)}
                      </div>
                    </div>
                  </div>

                  {analysis && (
                    <div className="space-y-4 md:col-span-2">
                      <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                        <FileText size={18} className="text-blue-600" />
                        Loan Analysis
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            PESTEL Analysis:
                          </span>
                          {formatData(analysis.pestelAnalysisUrl)}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">SWOT Analysis:</span>
                          {formatData(analysis.swotAnalysisUrl)}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            Risk Assessment:
                          </span>
                          {formatData(analysis.riskAssessmentUrl)}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">ESG Assessment:</span>
                          {formatData(analysis.esgAssessmentUrl)}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Financial Need:</span>
                          {formatData(analysis.financialNeedUrl)}
                        </div>
                        <div className="col-span-2">
                          <div className="flex flex-col text-sm">
                            <span className="text-gray-600 mb-1">
                              Analyst Conclusion:
                            </span>
                            <span className="font-medium text-gray-800">
                              {formatData(analysis.analystConclusion)}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex flex-col text-sm">
                            <span className="text-gray-600 mb-1">
                              Analyst Recommendation:
                            </span>
                            <span className="font-medium text-gray-800">
                              {formatData(analysis.analystRecommendation)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="bg-gray-50 border-t border-gray-200 flex justify-end py-4 px-6">
                  <Takesup
                    customerId={customer.id}
                    onSuccess={() => {
                      toast.success("Customer assigned successfully!");
                      fetchPendingCustomers(); // Reload the customer list automatically
                    }}
                  />
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
