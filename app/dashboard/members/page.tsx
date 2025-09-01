"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
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
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Eye,
  Loader2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const { data: session, error } = await authClient.getSession();
const currentUserId = session?.user.id;
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

interface Decision {
  id: string;
  customerId: string;
  applicationReferenceNumber: string;
  decision: string;
  decisionReason: string;
  committeeMember: string;
  createdAt: string;
}

export default function CommitteeDecisionPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decisionReasons, setDecisionReasons] = useState<
    Record<string, string>
  >({});
  const [selectedDecisions, setSelectedDecisions] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [existingDecisions, setExistingDecisions] = useState<
    Record<string, Decision>
  >({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

   const [isCOMMITTE_MEMBER, setIsCOMMITTE_MEMBER] = useState(false);
    
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
          if (data.user.role === "COMMITTE_MEMBER") {
            setIsCOMMITTE_MEMBER(true);
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

  const toggleRow = (applicationRef: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [applicationRef]: !prev[applicationRef],
    }));
  };

  const fetchPendingCustomers = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/get?status=MEMBER_REVIEW`);
      if (!response.ok) {
        throw new Error("Failed to fetch pending customers");
      }
      const data = await response.json();

      // Fetch loan analysis for each customer
      const customersWithAnalysis = await Promise.all(
        data.map(async (customer: Customer) => {
          try {
            const analysisResponse = await fetch(
              `/api/loan-analysis/${customer.applicationReferenceNumber}`
            );
            if (analysisResponse.ok) {
              const analysisData = await analysisResponse.json();
              return {
                ...customer,
                loanAnalysis: analysisData,
              };
            }
            return {
              ...customer,
              loanAnalysis: null,
            };
          } catch (err) {
            console.error(
              `Failed to fetch analysis for ${customer.applicationReferenceNumber}:`,
              err
            );
            return {
              ...customer,
              loanAnalysis: null,
            };
          }
        })
      );

      // Fetch existing decisions for these customers
      const decisionsMap: Record<string, Decision> = {};
      await Promise.all(
        customersWithAnalysis.map(async (customer) => {
          try {
            const decisionResponse = await fetch(
              `/api/member/${customer.applicationReferenceNumber}`
            );
            if (decisionResponse.ok) {
              const decisionData = await decisionResponse.json();
              if (decisionData && decisionData.userId === currentUserId) {
                decisionsMap[customer.applicationReferenceNumber] =
                  decisionData;
                // Pre-populate the selected decision and reason
                setSelectedDecisions((prev) => ({
                  ...prev,
                  [customer.applicationReferenceNumber]: decisionData.decision,
                }));
                setDecisionReasons((prev) => ({
                  ...prev,
                  [customer.applicationReferenceNumber]:
                    decisionData.decisionReason,
                }));
              }
            }
          } catch (err) {
            console.error(
              `Failed to fetch decision for ${customer.applicationReferenceNumber}:`,
              err
            );
          }
        })
      );

      setExistingDecisions(decisionsMap);
      setCustomers(customersWithAnalysis);
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

  const handleDecision = async (customerId: string, applicationRef: string) => {
    const decision = selectedDecisions[applicationRef];

    if (!decision) {
      toast.error("Please select a decision");
      return;
    }

    // For rejected status, require a reason
    if (decision === "REJECTED" && !decisionReasons[applicationRef]?.trim()) {
      toast.error("Please provide a decision reason for rejection");
      return;
    }

    // For "Need More Analysis" status, also require a reason
    if (
      decision === "COMMITTE_REVERSED" &&
      !decisionReasons[applicationRef]?.trim()
    ) {
      toast.error("Please provide feedback for what analysis is needed");
      return;
    }

    setIsSubmitting((prev) => ({ ...prev, [applicationRef]: true }));

    try {
      // First, record the decision using the new API
      const decisionResponse = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          applicationReferenceNumber: applicationRef,
          decision,
          decisionReason: decisionReasons[applicationRef] || "",
          committeeMember: "Current User", // Replace with actual user data
        }),
      });

      const decisionData = await decisionResponse.json();

      if (!decisionResponse.ok) {
        throw new Error(decisionData.error || "Failed to record decision");
      }

      if (decision !== "COMMITTE_REVERSED") {
        setCustomers((prev) => prev.filter((c) => c.id !== customerId));
      } else {
        // If it's "Need More Analysis", just update the existing decisions
        setExistingDecisions((prev) => ({
          ...prev,
          [applicationRef]: {
            id: decisionData.id,
            customerId,
            applicationReferenceNumber: applicationRef,
            decision,
            decisionReason: decisionReasons[applicationRef] || "",
            committeeMember: "Current User",
            createdAt: new Date().toISOString(),
          },
        }));
      }

      toast.success(`Decision submitted successfully`);

      // Clean up state if the customer is removed
      if (decision !== "COMMITTE_REVERSED") {
        setDecisionReasons((prev) => {
          const newReasons = { ...prev };
          delete newReasons[applicationRef];
          return newReasons;
        });

        setSelectedDecisions((prev) => {
          const newDecisions = { ...prev };
          delete newDecisions[applicationRef];
          return newDecisions;
        });
      }
    } catch (err: any) {
      console.error("Error submitting decision:", err);
      toast.error(err.message || "Failed to submit decision");
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [applicationRef]: false }));
    }
  };

  const handleReasonChange = (applicationRef: string, reason: string) => {
    setDecisionReasons((prev) => ({
      ...prev,
      [applicationRef]: reason,
    }));
  };

  const handleDecisionChange = (applicationRef: string, decision: string) => {
    setSelectedDecisions((prev) => ({
      ...prev,
      [applicationRef]: decision,
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        label: "Pending",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      COMMITTE_REVERSED: {
        label: "Needs More Analysis",
        color: "bg-blue-100 text-blue-800 border-blue-200",
      },
      COMMITTEE_REVIEW: {
        label: "Committee Review",
        color: "bg-purple-100 text-purple-800 border-purple-200",
      },
      APPROVED: {
        label: "Approved",
        color: "bg-green-100 text-green-800 border-green-200",
      },
      REJECTED: {
        label: "Rejected",
        color: "bg-red-100 text-red-800 border-red-200",
      },
      MEMBER_REVIEW: {
        label: "Member Review",
        color: "bg-orange-100 text-orange-800 border-orange-200",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      color: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return <Badge className={config.color}>{config.label}</Badge>;
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
   if (!isCOMMITTE_MEMBER) {
    return null;
  }
  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-2">
          Committee Decisions 📋
        </h1>
        <p className="text-gray-600 text-center max-w-2xl">
          Review and make decisions on loan applications awaiting committee
          review.
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
            <XCircle className="text-red-600" size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            Error Loading Applications
          </h2>
          <p className="text-lg text-gray-600 text-center mb-6 max-w-md">
            {error}
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
            No applications pending committee review. Check back later for new
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-blue-50 border-b border-blue-100 font-semibold text-gray-700">
            <div className="col-span-2">Customer</div>
            <div className="col-span-2">Reference No</div>
            <div className="col-span-2">Loan Details</div>
            <div className="col-span-2">Business</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Rows */}
          {customers.map((customer) => {
            const existingDecision =
              existingDecisions[customer.applicationReferenceNumber];
            const hasExistingDecision = !!existingDecision;
            const isExpanded =
              expandedRows[customer.applicationReferenceNumber];

            return (
              <div key={customer.id} className="border-b border-gray-100">
                {/* Collapsed Row View */}
                <div
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => toggleRow(customer.applicationReferenceNumber)}
                >
                  <div className="col-span-2 flex items-center">
                    <User size={16} className="text-blue-600 mr-2" />
                    <span className="font-medium">
                      {customer.firstName} {customer.lastName}
                    </span>
                  </div>
                  <div className="col-span-2 text-sm text-gray-600">
                    {customer.applicationReferenceNumber}
                  </div>
                  <div className="col-span-2 text-sm">
                    <div className="font-medium">
                      {formatData(customer.loanAmount)}
                    </div>
                    <div className="text-gray-500">{customer.loanType}</div>
                  </div>
                  <div className="col-span-2 text-sm">
                    <div>{customer.majorLineBusiness}</div>
                    <div className="text-gray-500">
                      {customer.economicSector}
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    {existingDecisions[customer.applicationReferenceNumber] && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Check size={12} className="mr-1" />
                        Decided
                      </Badge>
                    )}
                    {!existingDecisions[
                      customer.applicationReferenceNumber
                    ] && (
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        <Clock size={12} className="mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-end items-center">
                    <Button variant="ghost" size="sm" className="mr-2">
                      {isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                      {isExpanded ? "Less" : "Details"}
                    </Button>
                  </div>
                </div>

                {/* Expanded Row View */}
                {isExpanded && (
                  <div className="bg-gray-50 p-6 border-t border-gray-200">
                    <Card className="border-0 shadow-none">
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-0">
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
                            <div className="flex justify-between itemsCenter text-sm">
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
                                  new Date(
                                    customer.dateOfBirth
                                  ).toLocaleDateString()
                                )}
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
                              <p className="text-gray-600">
                                Initiation Center:
                              </p>
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
                              <p className="text-gray-600">Loan Purpose:</p>
                              <p className="font-medium text-gray-800">
                                {formatData(customer.purposeOfLoan)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Documents */}
                        <div className="space-y-4">
                          <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                            <FileText size={18} className="text-blue-600" />
                            Documents
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                              <p className="text-gray-600">National ID:</p>
                              {formatData(customer.nationalidUrl)}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <p className="text-gray-600">Agreement Form:</p>
                              {formatData(customer.agreementFormUrl)}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <p className="text-gray-600">
                                Major Business Doc:
                              </p>
                              {formatData(customer.majorLineBusinessUrl)}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <p className="text-gray-600">Application Form:</p>
                              {formatData(customer.applicationFormUrl)}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <p className="text-gray-600">Credit Profile:</p>
                              {formatData(customer.creditProfileUrl)}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <p className="text-gray-600">
                                Financial Profile:
                              </p>
                              {formatData(customer.financialProfileUrl)}
                            </div>
                            {customer.otherLineBusinessUrl && (
                              <div className="flex justify-between items-center text-sm">
                                <p className="text-gray-600">
                                  Other Business Doc:
                                </p>
                                {formatData(customer.otherLineBusinessUrl)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Loan Analysis */}
                        {customer.loanAnalysis && (
                          <div className="space-y-4">
                            <h3 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2 flex items-center gap-2">
                              <BarChart3 size={18} className="text-blue-600" />
                              Loan Analysis
                            </h3>
                            <div className="space-y-3">
                              {customer.loanAnalysis.financialProfileUrl && (
                                <div className="flex justify-between items-center text-sm">
                                  <p className="text-gray-600">
                                    Financial Profile:
                                  </p>
                                  {formatData(
                                    customer.loanAnalysis.financialProfileUrl
                                  )}
                                </div>
                              )}
                              {customer.loanAnalysis.pestelAnalysisUrl && (
                                <div className="flex justify-between items-center text-sm">
                                  <p className="text-gray-600">
                                    PESTEL Analysis:
                                  </p>
                                  {formatData(
                                    customer.loanAnalysis.pestelAnalysisUrl
                                  )}
                                </div>
                              )}
                              {customer.loanAnalysis.swotAnalysisUrl && (
                                <div className="flex justify-between items-center text-sm">
                                  <p className="text-gray-600">
                                    SWOT Analysis:
                                  </p>
                                  {formatData(
                                    customer.loanAnalysis.swotAnalysisUrl
                                  )}
                                </div>
                              )}
                              {customer.loanAnalysis.riskAssessmentUrl && (
                                <div className="flex justify-between items-center text-sm">
                                  <p className="text-gray-600">
                                    Risk Assessment:
                                  </p>
                                  {formatData(
                                    customer.loanAnalysis.riskAssessmentUrl
                                  )}
                                </div>
                              )}
                              {customer.loanAnalysis.esgAssessmentUrl && (
                                <div className="flex justify-between items-center text-sm">
                                  <p className="text-gray-600">
                                    ESG Assessment:
                                  </p>
                                  {formatData(
                                    customer.loanAnalysis.esgAssessmentUrl
                                  )}
                                </div>
                              )}
                              {customer.loanAnalysis.financialNeedUrl && (
                                <div className="flex justify-between items-center text-sm">
                                  <p className="text-gray-600">
                                    Financial Need:
                                  </p>
                                  {formatData(
                                    customer.loanAnalysis.financialNeedUrl
                                  )}
                                </div>
                              )}
                              {customer.loanAnalysis.analystConclusion && (
                                <div className="text-sm">
                                  <p className="text-gray-600 mb-1">
                                    Analyst Conclusion:
                                  </p>
                                  <p className="font-medium text-gray-800">
                                    {customer.loanAnalysis.analystConclusion}
                                  </p>
                                </div>
                              )}
                              {customer.loanAnalysis.analystRecommendation && (
                                <div className="text-sm">
                                  <p className="text-gray-600 mb-1">
                                    Analyst Recommendation:
                                  </p>
                                  <p className="font-medium text-gray-800">
                                    {
                                      customer.loanAnalysis
                                        .analystRecommendation
                                    }
                                  </p>
                                </div>
                              )}
                              {customer.loanAnalysis.rmRecommendation && (
                                <div className="text-sm">
                                  <p className="text-gray-600 mb-1">
                                    RM Recommendation:
                                  </p>
                                  <p className="font-medium text-gray-800">
                                    {customer.loanAnalysis.rmRecommendation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>

                      {/* Decision Form */}
                      <CardFooter className="bg-gray-50 border-t border-gray-200 p-6">
                        <div className="w-full space-y-4">
                          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            <ClipboardList
                              size={18}
                              className="text-blue-600"
                            />
                            Committee Decision
                          </h3>

                          {hasExistingDecision && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                              <p className="text-sm text-blue-700 font-medium">
                                You previously submitted a decision for this
                                application on{" "}
                                {new Date(
                                  existingDecision.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Decision
                              </label>
                              <select
                                value={
                                  selectedDecisions[
                                    customer.applicationReferenceNumber
                                  ] || ""
                                }
                                onChange={(e) =>
                                  handleDecisionChange(
                                    customer.applicationReferenceNumber,
                                    e.target.value
                                  )
                                }
                                disabled={!!hasExistingDecision} // 👈 disable if decision already exists
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                              >
                                <option value="">Select Decision</option>
                                <option value="APPROVED">Approve</option>
                                <option value="REJECTED">Reject</option>
                                <option value="COMMITTE_REVERSED">
                                  Need More Analysis
                                </option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Decision Reason
                                {(selectedDecisions[
                                  customer.applicationReferenceNumber
                                ] === "REJECTED" ||
                                  selectedDecisions[
                                    customer.applicationReferenceNumber
                                  ] === "COMMITTE_REVERSED") && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </label>
                              <textarea
                                value={
                                  decisionReasons[
                                    customer.applicationReferenceNumber
                                  ] || ""
                                }
                                onChange={(e) =>
                                  handleReasonChange(
                                    customer.applicationReferenceNumber,
                                    e.target.value
                                  )
                                }
                                placeholder={
                                  selectedDecisions[
                                    customer.applicationReferenceNumber
                                  ] === "REJECTED"
                                    ? "Please provide reason for rejection"
                                    : selectedDecisions[
                                        customer.applicationReferenceNumber
                                      ] === "COMMITTE_REVERSED"
                                    ? "Please specify what additional analysis is needed"
                                    : "Optional comments"
                                }
                                rows={3}
                                disabled={!!hasExistingDecision} // 👈 disable if decision exists
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-3">
                            <Button
                              onClick={() =>
                                toggleRow(customer.applicationReferenceNumber)
                              }
                              variant="outline"
                              className="border-gray-300 p-2"
                            >
                              <ChevronUp size={16} />
                            </Button>

                            {!hasExistingDecision && (
                              <Button
                                onClick={() =>
                                  handleDecision(
                                    customer.id,
                                    customer.applicationReferenceNumber
                                  )
                                }
                                disabled={
                                  isSubmitting[
                                    customer.applicationReferenceNumber
                                  ]
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {isSubmitting[
                                  customer.applicationReferenceNumber
                                ] ? (
                                  <>
                                    <RefreshCw
                                      size={16}
                                      className="animate-spin mr-2"
                                    />
                                    Submitting...
                                  </>
                                ) : (
                                  "Submit Decision"
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
    </div>
  );
}
