// pages/pending-customers.tsx
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
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast, Toaster } from "sonner";
import { TakeButton } from "@/components/TakeButton";
import { SaveButton } from "@/components/SaveButton";

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
  Upload,
  UserCheck,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { AskButton } from "@/components/AskButton";
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
  rmRecommendation: any;
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
  const [refreshing, setRefreshing] = useState(false);
  const [analysisData, setAnalysisData] = useState<
    Record<string, Partial<LoanAnalysis>>
  >({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  const [isCREDIT_ANALYST, setIsCREDIT_ANALYST] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkRoleStatus = async () => {
      try {
        const response = await fetch("/api/session");

        if (!response.ok) {
          throw new Error("Failed to fetch user session");
        }

        const data = await response.json();

        if (!data || !data.user) {
          router.push("/");
          return;
        }

        if (data.user.role === "CREDIT_ANALYST") {
          setIsCREDIT_ANALYST(true);
        } else {
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

  // Function to handle the file upload to Supabase Storage
  const uploadFile = async (file: File, path: string) => {
    if (!file) {
      throw new Error("No file selected for upload.");
    }

    const { data, error } = await supabase.storage
      .from("LOAN")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      throw new Error("Failed to upload file.");
    }

    const { data: publicUrlData } = supabase.storage
      .from("LOAN")
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  };

  const fetchPendingCustomers = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/credit?status=UNDER_REVIEW`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch available applications"
        );
      }
      const data = await response.json();
      setCustomers(data);

      const initialAnalysisData = data.reduce(
        (acc: any, customer: Customer) => {
          acc[customer.applicationReferenceNumber] =
            customer.loanAnalysis || {};
          return acc;
        },
        {}
      );
      setAnalysisData(initialAnalysisData);

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

  useEffect(() => {
    fetchPendingCustomers();
  }, []);

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
      toast.loading(`Uploading ${file.name}...`, { id: "upload-toast" });
      const filePath = `loan-analysis/${refNumber}/${field}-${file.name}`;
      const url = await uploadFile(file, filePath);

      toast.success("File uploaded successfully!", { id: "upload-toast" });

      setAnalysisData((prev) => ({
        ...prev,
        [refNumber]: {
          ...prev[refNumber],
          [field]: url,
        },
      }));
    } catch (err: any) {
      toast.dismiss("upload-toast");
      toast.error(
        err.message || "An unexpected error occurred during file upload."
      );
    }
  };

  const validateAnalysisData = (refNumber: string) => {
    const errors: string[] = [];
    const analysis = analysisData[refNumber];

    // Check all required fields
    if (!analysis?.pestelAnalysisUrl) {
      errors.push("PESTEL Analysis document is required");
    }
    if (!analysis?.swotAnalysisUrl) {
      errors.push("SWOT Analysis document is required");
    }
    if (!analysis?.riskAssessmentUrl) {
      errors.push("Risk Assessment document is required");
    }
    if (!analysis?.esgAssessmentUrl) {
      errors.push("ESG Assessment document is required");
    }
    if (!analysis?.financialNeedUrl) {
      errors.push("Financial Need document is required");
    }
    if (
      !analysis?.analystConclusion ||
      analysis.analystConclusion.trim() === ""
    ) {
      errors.push("Analyst Conclusion is required");
    }
    if (
      !analysis?.analystRecommendation ||
      analysis.analystRecommendation.trim() === ""
    ) {
      errors.push("Analyst Recommendation is required");
    }

    return errors;
  };

  const handleSaveSuccess = () => {
    toast.success("Analysis saved successfully!");
    window.location.reload();
  };

  const handleTakeSuccess = () => {
    toast.success("Analysis saved successfully!");
    window.location.reload();
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
          Under Review Applications
        </h1>
        <p className="text-gray-600 text-center max-w-2xl">
          Complete your analysis for applications assigned to you. All analysis
          fields are mandatory.
        </p>
        <Button
          onClick={fetchPendingCustomers}
          variant="outline"
          className="mt-4 gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh List"}
        </Button>
      </div>

      {error && (
        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto border-4 border-dashed border-gray-200 text-gray-700">
          <div className="mb-6 p-4 bg-green-100 rounded-full">
            <UserCheck className="text-green-600" size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            You analyzed ALL!
          </h2>
          <p className="text-lg text-gray-600 text-center mb-6 max-w-md">
            If you want another one to analyze.....{" "}
            <Link className="text-blue-500" href="/dashboard/credit">
              click here
            </Link>
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
            <UserCheck className="text-green-600" size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            All Caught Up!
          </h2>
          <p className="text-lg text-gray-600 text-center mb-6 max-w-md">
            There are no applications currently assigned to you for review.
          </p>
          <Button
            onClick={fetchPendingCustomers}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <RefreshCw size={18} />
            Check for New Assignments
          </Button>
        </div>
      )}

      {!isLoading && customers.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {customers.map((customer) => {
            const customerErrors =
              validationErrors[customer.applicationReferenceNumber] || [];

            return (
              <Card
                key={customer.id}
                className="max-w-4xl mx-auto overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
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
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
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
                        <p className="text-gray-600">Major Line of Business:</p>
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
                        <p className="text-gray-600">Customer Segmentation:</p>
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
                      Loan Request
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

                  <div className="space-y-4 md:col-span-2 mt-6">
                    <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                      <UserCheck size={18} className="text-blue-600" />
                      Loan Analysis & Recommendation
                      <span className="text-red-500 text-sm">
                        * All fields are mandatory
                      </span>
                    </h3>

                    {customerErrors.length > 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                          <AlertCircle size={16} />
                          Please complete the following required fields:
                        </div>
                        <ul className="list-disc list-inside text-red-600 text-sm">
                          {customerErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor={`pestelAnalysisUrl-${customer.id}`}
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <Upload size={14} /> PESTEL Analysis Doc *
                        </label>
                        <input
                          id={`pestelAnalysisUrl-${customer.id}`}
                          type="file"
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              customer.applicationReferenceNumber,
                              "pestelAnalysisUrl"
                            )
                          }
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {analysisData[customer.applicationReferenceNumber]
                            ?.pestelAnalysisUrl ? (
                            <a
                              href={
                                analysisData[
                                  customer.applicationReferenceNumber
                                ].pestelAnalysisUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Document
                            </a>
                          ) : (
                            "No file uploaded"
                          )}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor={`swotAnalysisUrl-${customer.id}`}
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <Upload size={14} /> SWOT Analysis Doc *
                        </label>
                        <input
                          id={`swotAnalysisUrl-${customer.id}`}
                          type="file"
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              customer.applicationReferenceNumber,
                              "swotAnalysisUrl"
                            )
                          }
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {analysisData[customer.applicationReferenceNumber]
                            ?.swotAnalysisUrl ? (
                            <a
                              href={
                                analysisData[
                                  customer.applicationReferenceNumber
                                ].swotAnalysisUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Document
                            </a>
                          ) : (
                            "No file uploaded"
                          )}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor={`riskAssessmentUrl-${customer.id}`}
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <Upload size={14} /> Risk Assessment Doc *
                        </label>
                        <input
                          id={`riskAssessmentUrl-${customer.id}`}
                          type="file"
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              customer.applicationReferenceNumber,
                              "riskAssessmentUrl"
                            )
                          }
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {analysisData[customer.applicationReferenceNumber]
                            ?.riskAssessmentUrl ? (
                            <a
                              href={
                                analysisData[
                                  customer.applicationReferenceNumber
                                ].riskAssessmentUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Document
                            </a>
                          ) : (
                            "No file uploaded"
                          )}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor={`esgAssessmentUrl-${customer.id}`}
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <Upload size={14} /> ESG Assessment Doc *
                        </label>
                        <input
                          id={`esgAssessmentUrl-${customer.id}`}
                          type="file"
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              customer.applicationReferenceNumber,
                              "esgAssessmentUrl"
                            )
                          }
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {analysisData[customer.applicationReferenceNumber]
                            ?.esgAssessmentUrl ? (
                            <a
                              href={
                                analysisData[
                                  customer.applicationReferenceNumber
                                ].esgAssessmentUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Document
                            </a>
                          ) : (
                            "No file uploaded"
                          )}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor={`financialNeedUrl-${customer.id}`}
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <Upload size={14} /> Financial Need Doc *
                        </label>
                        <input
                          id={`financialNeedUrl-${customer.id}`}
                          type="file"
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              customer.applicationReferenceNumber,
                              "financialNeedUrl"
                            )
                          }
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {analysisData[customer.applicationReferenceNumber]
                            ?.financialNeedUrl ? (
                            <a
                              href={
                                analysisData[
                                  customer.applicationReferenceNumber
                                ].financialNeedUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Document
                            </a>
                          ) : (
                            "No file uploaded"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <label
                        htmlFor={`analystConclusion-${customer.id}`}
                        className="text-sm font-medium"
                      >
                        <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                          <MessageSquare size={16} className="text-blue-600" />
                          Analyst Conclusion *
                        </h3>
                      </label>
                      <Textarea
                        id={`analystConclusion-${customer.id}`}
                        placeholder="Enter analyst's conclusion here (required)..."
                        value={
                          analysisData[customer.applicationReferenceNumber]
                            ?.analystConclusion || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            customer.applicationReferenceNumber,
                            "analystConclusion",
                            e.target.value
                          )
                        }
                        rows={4}
                        className={
                          !analysisData[customer.applicationReferenceNumber]
                            ?.analystConclusion
                            ? "border-red-300"
                            : ""
                        }
                      />
                    </div>

                    <div className="space-y-2 mt-4">
                      <label
                        htmlFor={`analystRecommendation-${customer.id}`}
                        className="text-sm font-medium"
                      >
                        <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                          <MessageSquare size={16} className="text-blue-600" />
                          Analyst Recommendation *
                        </h3>
                      </label>
                      <Textarea
                        id={`analystRecommendation-${customer.id}`}
                        placeholder="Enter analyst's recommendation here (required)..."
                        value={
                          analysisData[customer.applicationReferenceNumber]
                            ?.analystRecommendation || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            customer.applicationReferenceNumber,
                            "analystRecommendation",
                            e.target.value
                          )
                        }
                        rows={4}
                        className={
                          !analysisData[customer.applicationReferenceNumber]
                            ?.analystRecommendation
                            ? "border-red-300"
                            : ""
                        }
                      />
                    </div>

                    {customer.rmRecommendation && (
                      <div className="space-y-4 md:col-span-2">
                        <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                          <MessageSquare size={16} className="text-blue-600" />
                          Relationship Manager Answer/Recommendation for the
                          request
                        </h3>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <textarea
                            value={customer.rmRecommendation}
                            readOnly
                            className="w-full min-h-[120px] resize-none border border-gray-300 rounded-md p-2 text-sm text-gray-800 bg-white"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 mt-4">
                      <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                        <MessageSquare size={16} className="text-blue-600" />
                        Relationship Manager Recommendation request
                      </h3>
                      <AskButton
                        customerId={customer.id}
                        onSuccess={handleTakeSuccess}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center py-4 px-6 bg-gray-50 border-t border-gray-200">
                  <SaveButton
                    customerId={customer.id}
                    refNumber={customer.applicationReferenceNumber}
                    analysisData={analysisData}
                    validateAnalysisData={validateAnalysisData}
                    onSuccess={handleSaveSuccess}
                    actionType="saveAnalysis"
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
