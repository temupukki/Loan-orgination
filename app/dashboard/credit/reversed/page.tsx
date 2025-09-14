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
  AlertCircle,
  BarChart3,
  Upload,
  FileCheck,
  ClipboardList,
  Clock,
  AlertTriangle,
  Check,
  X,
  RotateCcw,
  UserCheck,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Reversed } from "@/components/Reversed";

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

// Define the interface for the Decision model
interface Decision {
  id: string;
  applicationReferenceNumber: string;
  decision: string;
  decisionReason: string;
  decisionDate: string;
  responsibleUnitName: string;
  responsibleUnitEmail: string;
  responsibleUnitPhone: string;
  createdAt: string;
  updatedAt: string;
}

// Update the Customer interface to include the LoanAnalysis relation
interface Customer {
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
  const [decisionData, setDecisionData] = useState<
    Record<string, Decision | null>
  >({});
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, string[]>>({});

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
      const response = await fetch(`/api/reversed?status=COMMITTE_REVERSED`);
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

      // Fetch decision data for each customer
      const decisionPromises = data.map(async (customer: Customer) => {
        const decision = await fetchDecision(
          customer.applicationReferenceNumber
        );
        return {
          refNumber: customer.applicationReferenceNumber,
          decision,
        };
      });

      const [analysisResults, decisionResults] = await Promise.all([
        Promise.all(analysisPromises),
        Promise.all(decisionPromises),
      ]);

      const initialAnalysisData = analysisResults.reduce((acc: any, result) => {
        acc[result.refNumber] = result.analysis || {};
        return acc;
      }, {});

      const initialDecisionData = decisionResults.reduce((acc: any, result) => {
        acc[result.refNumber] = result.decision || null;
        return acc;
      }, {});

      setAnalysisData(initialAnalysisData);
      setDecisionData(initialDecisionData);
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

  // Function to fetch decision data for a customer
  const fetchDecision = async (applicationReferenceNumber: string) => {
    try {
      const response = await fetch(
        `/api/decision/${applicationReferenceNumber}`
      );
      if (response.ok) {
        const decision = await response.json();
        return decision;
      }
      return null;
    } catch (err) {
      console.error(
        `Failed to fetch decision for ${applicationReferenceNumber}:`,
        err
      );
      return null;
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

  const toggleSection = (customerId: string, section: string) => {
    setExpandedSections(prev => {
      const customerSections = prev[customerId] || [];
      if (customerSections.includes(section)) {
        return {
          ...prev,
          [customerId]: customerSections.filter(s => s !== section)
        };
      } else {
        return {
          ...prev,
          [customerId]: [...customerSections, section]
        };
      }
    });
  };

  const isSectionExpanded = (customerId: string, section: string) => {
    return expandedSections[customerId]?.includes(section) || false;
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
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-1 text-xs md:text-sm"
        >
          <FileText size={12} />
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

  const getDecisionBadgeVariant = (decision: string) => {
    switch (decision?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision?.toLowerCase()) {
      case "approved":
        return <Check className="h-3 w-3 md:h-4 md:w-4" />;
      case "rejected":
        return <X className="h-3 w-3 md:h-4 md:w-4" />;
      case "pending":
        return <Clock className="h-3 w-3 md:h-4 md:w-4" />;
      default:
        return <AlertTriangle className="h-3 w-3 md:h-4 md:w-4" />;
    }
  };

  const CardSkeleton = () => (
    <Card className="w-full mx-auto">
      <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200 py-4">
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-6 w-full" />
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 p-4">
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

  const documentFields = [
    {
      field: "financialProfileUrl" as keyof LoanAnalysis,
      label: "Financial Profile",
    },
    {
      field: "pestelAnalysisUrl" as keyof LoanAnalysis,
      label: "PESTEL Analysis",
    },
    {
      field: "swotAnalysisUrl" as keyof LoanAnalysis,
      label: "SWOT Analysis",
    },
    {
      field: "riskAssessmentUrl" as keyof LoanAnalysis,
      label: "Risk Assessment",
    },
    {
      field: "esgAssessmentUrl" as keyof LoanAnalysis,
      label: "ESG Assessment",
    },
    {
      field: "financialNeedUrl" as keyof LoanAnalysis,
      label: "Financial Need",
    },
  ];

  return (
    <div className="container mx-auto p-3 md:p-6 bg-gray-50 min-h-screen">
      <title>Reversed | Loan Origination</title>
      <div className="flex flex-col items-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-center text-gray-900 mb-2">
          Reversed Applications 🔄
        </h1>
        <p className="text-gray-600 text-center text-sm md:text-base max-w-2xl">
          Review and complete analysis for applications that have been returned
          by the committee.
        </p>

        <div className="flex flex-wrap gap-2 md:gap-4 mt-4 md:mt-6 justify-center">
          <Button
            onClick={fetchPendingCustomers}
            variant="outline"
            className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 text-xs md:text-sm"
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex flex-col items-center p-4 md:p-8 bg-white rounded-xl md:rounded-2xl shadow-lg max-w-2xl mx-auto border-2 md:border-4 border-dashed border-gray-200 text-gray-700 mb-6 md:mb-8">
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-green-100 rounded-full">
            <UserCheck className="text-green-600" size={36} />
          </div>
          <h2 className="text-xl md:text-3xl font-extrabold text-gray-900 mb-2 md:mb-3">
            All Clear!
          </h2>
          <p className="text-sm md:text-lg text-gray-600 text-center mb-4 md:mb-6 max-w-md">
            No reversed applications at the moment. Check back later for new
            submissions.
          </p>
          <Button
            onClick={fetchPendingCustomers}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm"
            size="sm"
          >
            <RefreshCw size={14} />
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !error && customers.length === 0 && (
        <div className="flex flex-col items-center justify-center p-6 md:p-12 bg-white rounded-xl md:rounded-2xl shadow-lg max-w-2xl mx-auto border-2 md:border-4 border-dashed border-gray-200">
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-green-100 rounded-full">
            <CheckCircle2 className="text-green-600" size={36} />
          </div>
          <h2 className="text-xl md:text-3xl font-extrabold text-gray-900 mb-2 md:mb-3">
            All Clear!
          </h2>
          <p className="text-sm md:text-lg text-gray-600 text-center mb-4 md:mb-6 max-w-md">
            No reversed applications at the moment. Check back later for new
            submissions.
          </p>
          <Button
            onClick={fetchPendingCustomers}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm"
          >
            <RefreshCw size={14} />
            Check for New Applications
          </Button>
        </div>
      )}

      {!isLoading && customers.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {customers.map((customer) => {
            const analysis =
              analysisData[customer.applicationReferenceNumber] || {};
            const decision = decisionData[customer.applicationReferenceNumber];
            const isUploading = (field: string) =>
              uploading[`${customer.applicationReferenceNumber}-${field}`] !==
              undefined;

            return (
              <Card
                key={customer.id}
                className="w-full mx-auto overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-3 px-4 md:py-4 md:px-6">
                  <div className="flex flex-col gap-2 md:gap-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg md:text-2xl text-gray-900 flex items-center gap-2 font-extrabold">
                        <User size={20} className="text-blue-600" />
                        {customer.customerNumber?.startsWith("COMP")
                          ? customer.companyName
                          : `${customer.firstName} ${customer.middleName} ${customer.lastName}`}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800 border-yellow-200 py-1 px-2 font-semibold text-xs"
                      >
                        {customer.applicationStatus}
                      </Badge>
                    </div>

                    <CardDescription className="flex flex-col gap-1 text-xs md:text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <IdCard size={12} />
                        Ref:{" "}
                        <span className="font-medium text-gray-800">
                          {customer.applicationReferenceNumber}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Building size={12} />
                        Customer No:{" "}
                        <span className="font-medium text-gray-800">
                          {customer.customerNumber}
                        </span>
                      </span>
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="p-4 md:p-6 grid grid-cols-1 gap-4 md:gap-6">
                  {/* Decision Section - Added at the top */}
                  {decision && (
                    <div className="space-y-2">
                      <div 
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => toggleSection(customer.id, 'decision')}
                      >
                        <h3 className="font-bold text-base md:text-lg text-gray-800 flex items-center gap-2">
                          <AlertTriangle size={16} className="text-blue-600" />
                          Committee Decision
                        </h3>
                        {isSectionExpanded(customer.id, 'decision') ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </div>
                      
                      {isSectionExpanded(customer.id, 'decision') && (
                        <div className="grid grid-cols-1 gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex justify-between items-center text-xs md:text-sm">
                            <span className="text-gray-600">Decision:</span>
                            <Badge
                              className={getDecisionBadgeVariant(
                                decision.decision
                              )}
                            >
                              <span className="flex items-center gap-1">
                                {getDecisionIcon(decision.decision)}
                                {formatData(decision.decision)}
                              </span>
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center text-xs md:text-sm">
                            <span className="text-gray-600">Decision Date:</span>
                            <span className="font-medium text-gray-800">
                              {formatData(
                                decision.decisionDate
                                  ? new Date(
                                      decision.decisionDate
                                    ).toLocaleDateString()
                                  : "N/A"
                              )}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <div className="flex flex-col text-xs md:text-sm">
                              <span className="text-gray-600 mb-1">
                                Decision Reason:
                              </span>
                              <span className="font-medium text-gray-800 bg-white p-2 rounded-md border border-gray-200">
                                {formatData(decision.decisionReason)}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs md:text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-bold">
                                Decided By:
                              </span>
                              <span className="font-medium text-gray-800">
                                {formatData(decision.responsibleUnitName)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1 ml-3">
                              <span className="text-gray-600">Email:</span>
                              <span className="font-medium text-gray-800">
                                {formatData(decision.responsibleUnitEmail)}
                              </span>
                            </div>
                          
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Personal Information */}
                  <div className="space-y-2">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSection(customer.id, 'personal')}
                    >
                      <h3 className="font-bold text-base md:text-lg text-gray-800 flex items-center gap-2">
                        <User size={16} className="text-blue-600" />
                        Personal Information
                      </h3>
                      {isSectionExpanded(customer.id, 'personal') ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                    
                    {isSectionExpanded(customer.id, 'personal') && (
                      <div className="space-y-2 pl-2 border-l-2 border-blue-100 ml-1">
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">TIN:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.tinNumber)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">National ID:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.nationalId)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600 flex items-center gap-1">
                            <Phone size={12} />
                            Phone:
                          </p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.phone)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600 flex items-center gap-1">
                            <Mail size={12} />
                            Email:
                          </p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.email)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">Gender:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.gender)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">Marital Status:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.maritalStatus)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600 flex items-center gap-1">
                            <Calendar size={12} />
                            Date of Birth:
                          </p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(
                              new Date(customer.dateOfBirth).toLocaleDateString()
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address & Income */}
                  <div className="space-y-2">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSection(customer.id, 'address')}
                    >
                      <h3 className="font-bold text-base md:text-lg text-gray-800 flex items-center gap-2">
                        <MapPin size={16} className="text-blue-600" />
                        Address & Income
                      </h3>
                      {isSectionExpanded(customer.id, 'address') ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                    
                    {isSectionExpanded(customer.id, 'address') && (
                      <div className="space-y-2 pl-2 border-l-2 border-blue-100 ml-1">
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">Region:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.region)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">Zone:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.zone)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">City:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.city)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">Subcity:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.subcity)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">Woreda:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.woreda)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600 flex items-center gap-1">
                            <DollarSign size={12} />
                            Monthly Income:
                          </p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.monthlyIncome)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">Account Type:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.accountType)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Business Details */}
                  <div className="space-y-2">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSection(customer.id, 'business')}
                    >
                      <h3 className="font-bold text-base md:text-lg text-gray-800 flex items-center gap-2">
                        <Briefcase size={16} className="text-blue-600" />
                        Business Details
                      </h3>
                      {isSectionExpanded(customer.id, 'business') ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                    
                    {isSectionExpanded(customer.id, 'business') && (
                      <div className="space-y-2 pl-2 border-l-2 border-blue-100 ml-1">
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">Major Business:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.majorLineBusiness)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600 flex items-center gap-1">
                            <Calendar size={12} />
                            Established:
                          </p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(
                              new Date(
                                customer.dateOfEstablishmentMLB
                              ).toLocaleDateString()
                            )}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">Economic Sector:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.economicSector)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">Customer Segment:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.customerSegmentation)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">Initiation Center:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.creditInitiationCenter)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Loan Details */}
                  <div className="space-y-2">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSection(customer.id, 'loan')}
                    >
                      <h3 className="font-bold text-base md:text-lg text-gray-800 flex items-center gap-2">
                        <DollarSign size={16} className="text-blue-600" />
                        Loan Details
                      </h3>
                      {isSectionExpanded(customer.id, 'loan') ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                    
                    {isSectionExpanded(customer.id, 'loan') && (
                      <div className="space-y-2 pl-2 border-l-2 border-blue-100 ml-1">
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">Loan Type:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.loanType)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">Loan Amount:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.loanAmount)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">Loan Period:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.loanPeriod)} months
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">Repayment Mode:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.modeOfRepayment)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-xs md:text-sm">
                          <p className="text-gray-600">Purpose:</p>
                          <p className="font-medium text-gray-800 text-right">
                            {formatData(customer.purposeOfLoan)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Supporting Documents */}
                  <div className="space-y-2">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSection(customer.id, 'documents')}
                    >
                      <h3 className="font-bold text-base md:text-lg text-gray-800 flex items-center gap-2">
                        <FileText size={16} className="text-blue-600" />
                        Supporting Documents
                      </h3>
                      {isSectionExpanded(customer.id, 'documents') ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                    
                    {isSectionExpanded(customer.id, 'documents') && (
                      <div className="grid grid-cols-1 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">National ID:</span>
                          {formatData(customer.nationalidUrl)}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Agreement Form:</span>
                          {formatData(customer.agreementFormUrl)}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">
                            Major Business Doc:
                          </span>
                          {formatData(customer.majorLineBusinessUrl)}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Application Form:</span>
                          {formatData(customer.applicationFormUrl)}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">
                            Shareholders Details:
                          </span>
                          {formatData(customer.shareholdersDetailsUrl)}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Credit Profile:</span>
                          {formatData(customer.creditProfileUrl)}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">
                            Transaction Profile:
                          </span>
                          {formatData(customer.transactionProfileUrl)}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">
                            Collateral Profile:
                          </span>
                          {formatData(customer.collateralProfileUrl)}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">
                            Financial Profile:
                          </span>
                          {formatData(customer.financialProfileUrl)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Loan Analysis Section */}
                  <div className="space-y-2">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSection(customer.id, 'analysis')}
                    >
                      <h3 className="font-bold text-base md:text-lg text-gray-800 flex items-center gap-2">
                        <BarChart3 size={16} className="text-blue-600" />
                        Loan Analysis
                      </h3>
                      {isSectionExpanded(customer.id, 'analysis') ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                    
                    {isSectionExpanded(customer.id, 'analysis') && (
                      <div className="grid grid-cols-1 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {/* Document Uploads for Analysis */}
                        {documentFields.map(({ field, label }) => (
                          <div key={field} className="space-y-2">
                            <label
                              htmlFor={`${field}-${customer.id}`}
                              className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1"
                            >
                              <FileCheck size={12} />
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
                                className="block w-full text-xs md:text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 md:file:py-2 md:file:px-4 file:rounded-md file:border-0 file:text-xs md:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                disabled={isUploading(field)}
                              />
                              {isUploading(field) && (
                                <RefreshCw
                                  size={14}
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
                        <div className="space-y-2">
                          <label
                            htmlFor={`analystConclusion-${customer.id}`}
                            className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1"
                          >
                            <ClipboardList size={12} />
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
                            rows={3}
                            className="block w-full rounded-md border border-gray-300 py-2 px-3 text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor={`analystRecommendation-${customer.id}`}
                            className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1"
                          >
                            <ClipboardList size={12} />
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
                            rows={3}
                            className="block w-full rounded-md border border-gray-300 py-2 px-3 text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="bg-gray-50 border-t border-gray-200 flex justify-end py-4 px-4 md:px-6">
                  <Reversed
                    customerId={customer.id}
                    onSuccess={() => {
                      console.log("Analysis completed successfully");
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