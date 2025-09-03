"use client";

import { useState, useEffect, ChangeEvent } from "react";
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
import { CreditFinish } from "@/components/CreditFinish";
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
  BarChart3,
  Upload,
  FileCheck,
  ClipboardList,
  UserCheck,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  annualRevenue: number;
  companyName: string;
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
  const [analysisData, setAnalysisData] = useState<
    Record<string, Partial<LoanAnalysis>>
  >({});
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState<Record<string, string>>({});
  const [isCREDIT_ANALYST, setIsCREDIT_ANALYST] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Check if the current user is a relationship manager
    const checkRoleStatus = async () => {
      try {
        // Get the current user's role from your API
        const response = await fetch("/api/session");

        if (!response.ok) {
          throw new Error("Failed to fetch user session");
        }

        const data = await response.json();

        // Check if we have a valid session with user data
        if (!data || !data.user) {
          router.push("/");
          return;
        }

        // Check if user has relationship manager role
        if (data.user.role === "CREDIT_ANALYST") {
          setIsCREDIT_ANALYST(true);
        } else {
          // Redirect non-relationship manager users to dashboard
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error checking role status:", error);
        toast.error("Authentication check failed");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    checkRoleStatus();
  }, [router]);

  useEffect(() => {
    fetchPendingCustomers();
  }, []);

  const fetchPendingCustomers = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/final?status=FINAL_ANALYSIS`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch pending customers");
      }
      const data = await response.json();
      setCustomers(data);

      // Fetch loan analysis for each customer
      const analysisPromises = data.map(async (customer: Customer) => {
        try {
          const analysisResponse = await fetch(
            `/api/loan-analysis/${customer.applicationReferenceNumber}`
          );
          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();
            return {
              refNumber: customer.applicationReferenceNumber,
              analysis: analysisData,
            };
          }
          return {
            refNumber: customer.applicationReferenceNumber,
            analysis: {},
          };
        } catch (err) {
          console.error(
            `Failed to fetch analysis for ${customer.applicationReferenceNumber}:`,
            err
          );
          return {
            refNumber: customer.applicationReferenceNumber,
            analysis: {},
          };
        }
      });

      const analysisResults = await Promise.all(analysisPromises);
      const initialAnalysisData = analysisResults.reduce((acc: any, result) => {
        acc[result.refNumber] = result.analysis || {};
        return acc;
      }, {});

      setAnalysisData(initialAnalysisData);
      setError(null);
    } catch (err: any) {
      setError(
        err.message ||
          "We're having trouble connecting to the server. Please try again in a moment."
      );
      setCustomers([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    // Simulate file upload - replace with your actual upload logic
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(`https://example.com/uploads/${path}`);
      }, 1500);
    });
  };

  const handleInputChange = (
    refNumber: string,
    field: keyof LoanAnalysis,
    value: string
  ) => {
    setAnalysisData((prev) => ({
      ...prev,
      [refNumber]: {
        ...prev[refNumber],
        [field]: value,
      },
    }));
  };

  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    refNumber: string,
    field: keyof LoanAnalysis
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading((prev) => ({
        ...prev,
        [`${refNumber}-${field}`]: file.name,
      }));
      toast.loading(`Uploading ${file.name}...`);

      const filePath = `loan-analysis/${refNumber}/${field}-${file.name}`;
      const url = await uploadFile(file, filePath);

      setUploading((prev) => {
        const newState = { ...prev };
        delete newState[`${refNumber}-${field}`];
        return newState;
      });

      toast.dismiss();
      toast.success("File uploaded successfully!");

      setAnalysisData((prev) => ({
        ...prev,
        [refNumber]: {
          ...prev[refNumber],
          [field]: url,
        },
      }));
    } catch (err: any) {
      setUploading((prev) => {
        const newState = { ...prev };
        delete newState[`${refNumber}-${field}`];
        return newState;
      });

      toast.dismiss();
      toast.error(
        err.message || "An unexpected error occurred during file upload."
      );
    }
  };

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-700">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isCREDIT_ANALYST) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-2">
          Final Analysis Applications 📋
        </h1>
        <p className="text-gray-600 text-center max-w-2xl">
          Complete the final analysis and submit your recommendations for loan
          approval.
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
          <div className="mb-6 p-4 bg-green-100 rounded-full">
            <UserCheck className="text-green-600" size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            All Clear!
          </h2>
          <p className="text-lg text-gray-600 text-center mb-6 max-w-md">
            No applications pending final analysis. Check back later for new
            submissions.
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
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            All Clear!
          </h2>
          <p className="text-lg text-gray-600 text-center mb-6 max-w-md">
            No applications pending final analysis. Check back later for new
            submissions.
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
            const analysis =
              analysisData[customer.applicationReferenceNumber] || {};
            const isUploading = (field: string) =>
              uploading[`${customer.applicationReferenceNumber}-${field}`] !==
              undefined;

            const documentFields = [
              {
                field: "financialProfileUrl" as keyof LoanAnalysis,
                label: "Financial Profile Doc",
              },
              {
                field: "pestelAnalysisUrl" as keyof LoanAnalysis,
                label: "PESTEL Analysis Doc",
              },
              {
                field: "swotAnalysisUrl" as keyof LoanAnalysis,
                label: "SWOT Analysis Doc",
              },
              {
                field: "riskAssessmentUrl" as keyof LoanAnalysis,
                label: "Risk Assessment Doc",
              },
              {
                field: "esgAssessmentUrl" as keyof LoanAnalysis,
                label: "ESG Assessment Doc",
              },
              {
                field: "financialNeedUrl" as keyof LoanAnalysis,
                label: "Financial Need Doc",
              },
            ];

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
                        {customer.customerNumber?.startsWith("COMP")
                          ? customer.companyName
                          : `${customer.firstName} ${customer.middleName} ${customer.lastName}`}
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
                  {/* Personal Information */}
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
                          {customer.customerNumber?.startsWith("COMP")
                            ? "Annual Revenue:"
                            : "Monthly Income:"}
                        </p>
                        <p className="font-medium text-gray-800">
                          {formatData(
                            customer.customerNumber?.startsWith("COMP")
                              ? customer.annualRevenue || 0
                              : customer.monthlyIncome || 0
                          )}
                        </p>
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

                  {/* Loan Details */}
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

                  {/* Loan Analysis Section */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                      <BarChart3 size={18} className="text-blue-600" />
                      Loan Analysis & Recommendation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {/* Document Uploads for Analysis */}
                      {documentFields.map(({ field, label }) => (
                        <div key={field} className="space-y-2">
                          <label
                            htmlFor={`${field}-${customer.id}`}
                            className="text-sm font-medium text-gray-700 flex items-center gap-1"
                          >
                            <FileCheck size={14} />
                            {label}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              id={`${field}-${customer.id}`}
                              type="file"
                              onChange={(e) =>
                                handleFileUpload(
                                  e,
                                  customer.applicationReferenceNumber,
                                  field
                                )
                              }
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              disabled={isUploading(field)}
                            />
                            {isUploading(field) && (
                              <RefreshCw
                                size={16}
                                className="animate-spin text-blue-600"
                              />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {analysis[field] ? (
                              <a
                                href={analysis[field] as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                              >
                                <FileText size={12} />
                                View Current Document
                              </a>
                            ) : (
                              "No file uploaded"
                            )}
                          </p>
                        </div>
                      ))}

                      {/* Input fields for analyst's text */}
                      <div className="col-span-2 space-y-2">
                        <label
                          htmlFor={`analystConclusion-${customer.id}`}
                          className="text-sm font-medium text-gray-700 flex items-center gap-1"
                        >
                          <ClipboardList size={14} />
                          Analyst Conclusion
                        </label>
                        <textarea
                          id={`analystConclusion-${customer.id}`}
                          placeholder="Enter analyst's conclusion here..."
                          value={analysis.analystConclusion || ""}
                          onChange={(e) =>
                            handleInputChange(
                              customer.applicationReferenceNumber,
                              "analystConclusion",
                              e.target.value
                            )
                          }
                          rows={4}
                          className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-2 space-y-2">
                        <label
                          htmlFor={`analystRecommendation-${customer.id}`}
                          className="text-sm font-medium text-gray-700 flex items-center gap-1"
                        >
                          <ClipboardList size={14} />
                          Analyst Recommendation
                        </label>
                        <textarea
                          id={`analystRecommendation-${customer.id}`}
                          placeholder="Enter analyst's recommendation here..."
                          value={analysis.analystRecommendation || ""}
                          onChange={(e) =>
                            handleInputChange(
                              customer.applicationReferenceNumber,
                              "analystRecommendation",
                              e.target.value
                            )
                          }
                          rows={4}
                          className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-gray-50 border-t border-gray-200 flex justify-end py-4 px-6">
                  <CreditFinish
                    customerId={customer.id}
                    onSuccess={() => {
                      console.log("Final analysis completed successfully");
                      toast.success("Application finalized successfully!");
                      fetchPendingCustomers();
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