"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Clock,
  AlertCircle,
  Plus,
  Eye,
  Loader2,
  RefreshCw,
  Shield,
  Filter,
  Info,
  ClipboardCheck,
  AlertTriangle,
  Mail,
  HelpCircle,
  Download,
  Calendar,
  TrendingUp,
  Gavel,
  Scale,
  CalendarCheck,
  Award,
  FileBarChart,
  Network,
  Handshake,
  UserPlus,
  MessageSquare,
  BarChart2,
  Server,
  UserCog,
  Ban,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    image?: string;
  };
}

interface Customer {
  companyName: string;
  customerNumber: any;
  id: string;
  applicationReferenceNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  loanAmount: number;
  loanType: string;
  applicationStatus: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

export default function Dashboard() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    async function getSession() {
      try {
        const { data, error } = await authClient.getSession();

        if (error || !data) {
          router.push("/");
          return;
        }

        const sessionData = data as unknown as UserSession;

        // Check if user has appropriate role
        if (
          ![
            "ADMIN",
            "RELATIONSHIP_MANAGER",
            "CREDIT_ANALYST",
            "SUPERVISOR",
            "COMMITTE_MEMBER",
            "BANNED",
            "APPROVAL_COMMITTE",
          ].includes(sessionData.user.role)
        ) {
          router.push("/sign-in");
          return;
        }

        setSession(sessionData);
      } catch (error) {
        console.error("Session error:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    getSession();
  }, [router]);

  useEffect(() => {
    if (session?.user?.role) {
      fetchCustomers();
    }
  }, [session]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/manage");

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const customersData: Customer[] = await response.json();
      setCustomers(customersData);
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      setError(err.message || "Failed to load customers");
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string = "") => {
    const safeStatus = (status || "").toLowerCase();
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      under_review: "bg-blue-100 text-blue-800",
      committee_review: "bg-purple-100 text-purple-800",
      supervised: "bg-indigo-100 text-indigo-800",
      analysis_completed: "bg-teal-100 text-teal-800",
      rm_recomendation: "bg-orange-100 text-orange-800",
      supervisor_reviewing: "bg-pink-100 text-pink-800",
      final_analysis: "bg-cyan-100 text-cyan-800",
      member_review: "bg-amber-100 text-amber-800",
      committe_reversed: "bg-rose-100 text-rose-800",
    };
    return (
      variants[safeStatus as keyof typeof variants] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const formatStatusText = (status: string = "") => {
    const statusMap: Record<string, string> = {
      pending: "PENDING",
      approved: "APPROVED",
      rejected: "REJECTED",
      under_review: "UNDER_REVIEW",
      committee_review: "COMMITTE_REVIEW",
      supervised: "SUPERVISED",
      analysis_completed: "ANALYSIS_COMPLETED",
      rm_recomendation: "RM_RECOMMENDATION",
      supervisor_reviewing: "SUPERVISOR_REVIEWING",
      final_analysis: "FINAL_ANALYSIS",
      member_review: "MEMBER_REVIEW",
      committe_reversed: "COMMITTEE_REVERSED",
    };
    return statusMap[status.toLowerCase()] || status.toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStats = () => {
    const total = customers.length;
    const pending = customers.filter((c) =>
      c.applicationStatus.toLowerCase().includes("pending")
    ).length;
    const under_review = customers.filter(
      (c) => c.applicationStatus.toLowerCase() === "under_review"
    ).length;
    const approved = customers.filter(
      (c) => c.applicationStatus.toLowerCase() === "approved"
    ).length;
    const rejected = customers.filter(
      (c) => c.applicationStatus.toLowerCase() === "rejected"
    ).length;
    const supervised = customers.filter(
      (c) => c.applicationStatus.toLowerCase() === "supervised"
    ).length;
    const committe_reversed = customers.filter(
      (c) => c.applicationStatus.toLowerCase() === "committe_reversed"
    ).length;
    const final_analysis = customers.filter(
      (c) => c.applicationStatus.toLowerCase() === "final_analysis"
    ).length;
    const analysis_completed = customers.filter(
      (c) => c.applicationStatus.toLowerCase() === "analysis_completed"
    ).length;
    const supervisor_reviewing = customers.filter(
      (c) => c.applicationStatus.toLowerCase() === "supervisor_reviewing"
    ).length;
    const member_review = customers.filter(
      (c) => c.applicationStatus.toLowerCase() === "member_review"
    ).length;
    const committee_review = customers.filter(
      (c) => c.applicationStatus.toLowerCase() === "committee_review"
    ).length;

    return {
      total,
      pending,
      approved,
      rejected,
      under_review,
      supervised,
      committe_reversed,
      final_analysis,
      analysis_completed,
      supervisor_reviewing,
      member_review,
      committee_review,
    };
  };

  const getFilteredCustomers = () => {
    if (session?.user.role === "credit_analyst") {
      // For credit analysts, only show pending applications assigned to them
      return customers.filter(
        (customer) =>
          (customer.applicationStatus.toLowerCase().includes("pending") ||
            customer.applicationStatus.toLowerCase().includes("under_review") ||
            customer.applicationStatus
              .toLowerCase()
              .includes("committee_review") ||
            customer.applicationStatus.toLowerCase().includes("supervised") ||
            customer.applicationStatus
              .toLowerCase()
              .includes("analysis_completed") ||
            customer.applicationStatus
              .toLowerCase()
              .includes("rm_recomendation") ||
            customer.applicationStatus
              .toLowerCase()
              .includes("supervisor_reviewing") ||
            customer.applicationStatus
              .toLowerCase()
              .includes("final_analysis") ||
            customer.applicationStatus
              .toLowerCase()
              .includes("under_review")) &&
          customer.assignedTo === session.user.id
      );
    }

    // For relationship managers, apply the selected filter
    if (filter === "pending") {
      return customers.filter(
        (customer) =>
          customer.applicationStatus.toLowerCase().includes("pending") ||
          customer.applicationStatus.toLowerCase().includes("under_review") ||
          customer.applicationStatus.toLowerCase().includes("analysis")
      );
    } else if (filter === "approved") {
      return customers.filter(
        (customer) => customer.applicationStatus.toLowerCase() === "approved"
      );
    } else if (filter === "rejected") {
      return customers.filter(
        (customer) => customer.applicationStatus.toLowerCase() === "rejected"
      );
    }

    // Default: show all applications for relationship managers
    return customers;
  };

  const stats = getStats();
  const filteredCustomers = getFilteredCustomers();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <title>Dashboard | Loan Orgination</title>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Loan Applications
            </h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {session.user.role
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Badge>
          </div>
          <p className="text-gray-600 mt-1">Manage and review applications</p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={fetchCustomers}
            variant="outline"
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {/* Only show "New Application" button for Relationship Managers and Admins */}
          {session.user.role === "RELATIONSHIP_MANAGER" && (
            <Link href="/dashboard/fetch">
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                New Application
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Overview - Only show for Relationship Managers */}
      {session.user.role === "RELATIONSHIP_MANAGER" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Applications
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-600">All applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-gray-600">Needs review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-gray-600">Approved applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
              <p className="text-xs text-gray-600">Rejected applications</p>
            </CardContent>
          </Card>
        </div>
      )}
      {session.user.role === "CREDIT_ANALYST" && (
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-700">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* Available Applications Card */}
            <Link href="/dashboard/credit">
              <Card
                className={
                  stats.pending > 0 ? "animate-pulse ring-3 ring-green-500" : ""
                }
              >
                {" "}
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">
                    Available
                  </CardTitle>
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      stats.pending > 0
                        ? "bg-green-100 animate-pulse group-hover:bg-green-200"
                        : "bg-gray-100 group-hover:bg-gray-200"
                    }`}
                  >
                    <Users
                      className={`h-4 w-4 ${
                        stats.pending > 0 ? "text-green-600" : "text-gray-500"
                      }`}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                      {stats.pending}
                    </span>
                    {stats.pending > 0 && (
                      <span className="ml-2 text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        Attention
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">New applications</p>
                </CardContent>
              </Card>
            </Link>

            {/* In Progress Card */}
            <Link href="/dashboard/credit/analysis">
              <Card
                className={
                  stats.under_review > 0
                    ? "animate-pulse ring-3 ring-red-500"
                    : ""
                }
              >
                {" "}
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">
                    In Progress
                  </CardTitle>
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      stats.under_review > 0
                        ? "bg-blue-100 group-hover:bg-blue-200"
                        : "bg-gray-100 group-hover:bg-gray-200"
                    }`}
                  >
                    <Clock
                      className={`h-4 w-4 ${
                        stats.under_review > 0
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                      {stats.under_review}
                    </span>
                    {stats.under_review > 0 && (
                      <span className="ml-2 text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                        Attention
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Being analyzed</p>
                </CardContent>
              </Card>
            </Link>

            {/* Revised Applications Card */}
            <Link href="/dashboard/credit/revised">
              <Card
                className={
                  stats.supervised > 0
                    ? "animate-pulse ring-3 ring-red-500"
                    : ""
                }
              >
                {" "}
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">
                    Revised
                  </CardTitle>
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      stats.supervised > 0
                        ? "bg-amber-100 group-hover:bg-amber-200"
                        : "bg-gray-100 group-hover:bg-gray-200"
                    }`}
                  >
                    <FileText
                      className={`h-4 w-4 ${
                        stats.supervised > 0
                          ? "text-amber-600"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                      {stats.supervised}
                    </span>
                    {stats.supervised > 0 && (
                      <span className="ml-2 text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                        Attention
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">revised</p>
                </CardContent>
              </Card>
            </Link>

            {/* Reversed Applications Card */}
            <Link href="/dashboard/credit/reversed">
              <Card
                className={
                  stats.committe_reversed > 0
                    ? "animate-pulse ring-3 ring-red-500"
                    : ""
                }
              >
                {" "}
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">
                    Reversed
                  </CardTitle>
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      stats.committe_reversed > 0
                        ? "bg-red-100 group-hover:bg-red-200"
                        : "bg-gray-100 group-hover:bg-gray-200"
                    }`}
                  >
                    <AlertCircle
                      className={`h-4 w-4 ${
                        stats.committe_reversed > 0
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                      {stats.committe_reversed}
                    </span>
                    {stats.committe_reversed > 0 && (
                      <span className="ml-2 text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                        Attention
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Committee decisions
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Final Analysis Card */}
            <Link href="/dashboard/credit/final">
              <Card
                className={
                  stats.final_analysis > 0
                    ? "animate-pulse ring-3 ring-red-500"
                    : ""
                }
              >
                {" "}
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">
                    Final Review
                  </CardTitle>
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      stats.final_analysis > 0
                        ? "bg-purple-100 group-hover:bg-purple-200"
                        : "bg-gray-100 group-hover:bg-gray-200"
                    }`}
                  >
                    <ClipboardCheck
                      className={`h-4 w-4 ${
                        stats.final_analysis > 0
                          ? "text-purple-600"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                      {stats.final_analysis}
                    </span>
                    {stats.final_analysis > 0 && (
                      <span className="ml-2 text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                        Attention
                      </span>
                    )}
                  </div>{" "}
                  <p className="text-xs text-gray-500 mt-1">Pending approval</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Guidelines Section - Improved Design */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl mr-4 shadow-md">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Credit Analysis Guidelines
                  </h3>
                  <p className="text-gray-600">
                    Process requirements and best practices
                  </p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1">
                Updated Today
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Timeframe Requirements
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-blue-800">1</span>
                    </div>
                    <span>
                      Initial analysis must be completed within{" "}
                      <span className="font-semibold text-blue-700">
                        3 working days
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-blue-800">2</span>
                    </div>
                    <span>
                      Final approval should be completed within 5 working days
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-blue-800">3</span>
                    </div>
                    <span>
                      Urgent cases should be prioritized and completed in 24
                      hours
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                <div className="flex items-center mb-3">
                  <div className="bg-amber-100 p-2 rounded-lg mr-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Priority Handling
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-amber-800">
                        1
                      </span>
                    </div>
                    <span>
                      Applications with flashing indicators require immediate
                      attention
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-amber-800">
                        2
                      </span>
                    </div>
                    <span>High-value applications should be prioritized</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-amber-800">
                        3
                      </span>
                    </div>
                    <span>
                      Corporate clients receive priority over individual
                      applications
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                <div className="flex items-center mb-3">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Documentation Standards
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-green-800">
                        1
                      </span>
                    </div>
                    <span>
                      All analyses must include complete risk assessment
                      sections
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-green-800">
                        2
                      </span>
                    </div>
                    <span>
                      Financial evaluation must follow the standardized template
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-green-800">
                        3
                      </span>
                    </div>
                    <span>
                      Recommendation sections must be clearly justified with
                      data
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                <div className="flex items-center mb-3">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Communication Protocol
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-purple-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-purple-800">
                        1
                      </span>
                    </div>
                    <span>
                      Contact business development for missing documentation
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-purple-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-purple-800">
                        2
                      </span>
                    </div>
                    <span>
                      Escalate issues to supervisor after 24 hours without
                      response
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-purple-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-purple-800">
                        3
                      </span>
                    </div>
                    <span>
                      Use the designated portal for all client communication
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {session.user.role === "SUPERVISOR" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            <Link href="/dashboard/supervisor-review">
              <Card
                className={
                  stats.analysis_completed > 0
                    ? "animate-pulse ring-3 ring-green-500"
                    : ""
                }
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avaliable Applications
                  </CardTitle>
                  <Users
                    className={`h-4 w-6 text-red-600 ${
                      stats.analysis_completed > 0 ? "animate-bounce" : ""
                    }`}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.analysis_completed}
                  </div>
                  <p className="text-xs text-gray-600">
                    All Avaliable applications
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/supervisor-review/supervisor">
              <Card
                className={
                  stats.supervisor_reviewing > 0
                    ? "animate-pulse ring-3 ring-red-500"
                    : ""
                }
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    In Progress
                  </CardTitle>
                  <Clock
                    className={`h-4 w-6 text-red-600 ${
                      stats.supervisor_reviewing > 0 ? "animate-bounce" : ""
                    }`}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.supervisor_reviewing}
                  </div>
                  <p className="text-xs text-gray-600">
                    finish your review ASAP!
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-xl mr-4 shadow-md">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Supervisor Guidelines
                  </h3>
                  <p className="text-gray-600">
                    Process overview and team management best practices
                  </p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-3 py-1">
                Updated Today
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                <div className="flex items-center mb-3">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Response Time Targets
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-purple-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-purple-800">
                        1
                      </span>
                    </div>
                    <span>
                      Review and approve or reject applications within{" "}
                      <span className="font-semibold text-purple-700">
                        2 working days
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-purple-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-purple-800">
                        2
                      </span>
                    </div>
                    <span>
                      Provide feedback to analysts on revised applications in 24
                      hours
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-purple-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-purple-800">
                        3
                      </span>
                    </div>
                    <span>
                      Prioritize urgent cases and ensure completion within 4
                      hours
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-rose-50 p-5 rounded-xl border border-rose-100">
                <div className="flex items-center mb-3">
                  <div className="bg-rose-100 p-2 rounded-lg mr-3">
                    <AlertCircle className="h-5 w-5 text-rose-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Escalation Protocol
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-rose-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-rose-800">1</span>
                    </div>
                    <span>
                      Escalate any unaddressed analyst issues to the head of
                      credit within 2 days
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-rose-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-rose-800">2</span>
                    </div>
                    <span>
                      Flag high-risk applications immediately for committee
                      review
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-rose-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-rose-800">3</span>
                    </div>
                    <span>
                      Review and document all reversed applications for future
                      training
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                <div className="flex items-center mb-3">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Documentation & Reporting
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-green-800">
                        1
                      </span>
                    </div>
                    <span>
                      Ensure all analyst reports are complete and follow the
                      standard template
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-green-800">
                        2
                      </span>
                    </div>
                    <span>
                      Conduct weekly audits of finalized applications for
                      quality assurance
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-green-800">
                        3
                      </span>
                    </div>
                    <span>
                      Provide a monthly summary report on team performance and
                      key metrics
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Team Management
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-blue-800">1</span>
                    </div>
                    <span>
                      Regularly monitor team workload and reassign tasks to
                      balance distribution
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-blue-800">2</span>
                    </div>
                    <span>
                      Provide constructive feedback and mentorship to junior
                      analysts
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-blue-800">3</span>
                    </div>
                    <span>
                      Lead weekly team meetings to discuss complex cases and
                      share insights
                    </span>
                  </li>
                </ul>
              </div>
            </div>

           
            
          </div>
        </>
      )}
      {session.user.role === "COMMITTE_MEMBER" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 mb-8">
            <Link href="/dashboard/members">
              <Card
                className={
                  stats.member_review > 0
                    ? "animate-pulse ring-3 ring-green-500"
                    : ""
                }
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Available Applications
                  </CardTitle>
                  <Users
                    className={`h-4 w-6 text-red-600 ${
                      stats.member_review > 0 ? "animate-bounce" : ""
                    }`}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.member_review}
                  </div>
                  <p className="text-xs text-gray-600">
                    All Available applications
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-slate-500 to-gray-700 p-3 rounded-xl mr-4 shadow-md">
                  <Gavel className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Credit Committee Guidelines
                  </h3>
                  <p className="text-gray-600">
                    Final decision-making and strategic oversight
                  </p>
                </div>
              </div>
              <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200 px-3 py-1">
                Updated Today
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div className="flex items-center mb-3">
                  <div className="bg-slate-100 p-2 rounded-lg mr-3">
                    <Gavel className="h-5 w-5 text-slate-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Final Decision-Making
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-slate-800">
                        1
                      </span>
                    </div>
                    <span>
                      All applications must receive a final decision of{" "}
                      <span className="font-semibold text-slate-700">
                        Approved, Denied, or Revised
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-slate-800">
                        2
                      </span>
                    </div>
                    <span>
                      Provide a clear and concise justification for all final
                      decisions
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-slate-800">
                        3
                      </span>
                    </div>
                    <span>
                      Decisions on high-value loans must be unanimous among all
                      members
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                <div className="flex items-center mb-3">
                  <div className="bg-orange-100 p-2 rounded-lg mr-3">
                    <Eye className="h-5 w-5 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Review & Oversight
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-orange-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-orange-800">
                        1
                      </span>
                    </div>
                    <span>
                      Carefully review analysis from both the analyst and
                      supervisor
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-orange-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-orange-800">
                        2
                      </span>
                    </div>
                    <span>
                      Ensure all necessary documentation and due diligence have
                      been completed
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-orange-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-orange-800">
                        3
                      </span>
                    </div>
                    <span>
                      Monitor a sample of approved loans to maintain quality
                      control
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                <div className="flex items-center mb-3">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <ClipboardCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Policy & Compliance
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-green-800">
                        1
                      </span>
                    </div>
                    <span>
                      Ensure all lending activities are compliant with federal
                      and state regulations
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-green-800">
                        2
                      </span>
                    </div>
                    <span>
                      Continuously review and update internal loan policies as
                      needed
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-green-800">
                        3
                      </span>
                    </div>
                    <span>
                      Document any exceptions to policy and the reasons for
                      their approval
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-cyan-50 p-5 rounded-xl border border-cyan-100">
                <div className="flex items-center mb-3">
                  <div className="bg-cyan-100 p-2 rounded-lg mr-3">
                    <TrendingUp className="h-5 w-5 text-cyan-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Strategic Input
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-cyan-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-cyan-800">1</span>
                    </div>
                    <span>
                      Identify trends in loan applications and portfolio
                      performance
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-cyan-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-cyan-800">2</span>
                    </div>
                    <span>
                      Provide feedback to senior management on market conditions
                      and lending risks
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-cyan-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-cyan-800">3</span>
                    </div>
                    <span>
                      Participate in quarterly reviews of the overall lending
                      strategy
                    </span>
                  </li>
                </ul>
              </div>
            </div>

   
          </div>
        </>
      )}
      {session.user.role === "APPROVAL_COMMITTE" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6 mb-8">
            <Link href="/dashboard/view">
              <Card
                className={
                  stats.member_review > 0
                    ? "animate-pulse ring-3 ring-green-500"
                    : ""
                }
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Available Applications
                  </CardTitle>
                  <Users
                    className={`h-4 w-6 text-red-600 ${
                      stats.member_review > 0 ? "animate-bounce" : ""
                    }`}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.member_review}
                  </div>
                  <p className="text-xs text-gray-600">
                    All Available applications
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-800 to-indigo-900 p-3 rounded-xl mr-4 shadow-md">
                  <Award className="h-6 w-6 text-yellow-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Credit Committee Manager Guidelines
                  </h3>
                  <p className="text-gray-600">
                    Administrative oversight and strategic leadership
                  </p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1">
                Updated Today
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <CalendarCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Committee Administration
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-blue-800">1</span>
                    </div>
                    <span>
                      Schedule and chair all committee meetings, ensuring all
                      required members are present.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-blue-800">2</span>
                    </div>
                    <span>
                      Distribute meeting agendas and relevant documents at least
                      24 hours in advance.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-blue-800">3</span>
                    </div>
                    <span>
                      Maintain and update the official record of all committee
                      decisions and minutes.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100">
                <div className="flex items-center mb-3">
                  <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                    <FileBarChart className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Strategic Oversight
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-yellow-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-yellow-800">
                        1
                      </span>
                    </div>
                    <span>
                      Analyze loan portfolio performance and identify emerging
                      risk trends.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-yellow-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-yellow-800">
                        2
                      </span>
                    </div>
                    <span>
                      Lead discussions on policy adjustments to adapt to market
                      conditions.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-yellow-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-yellow-800">
                        3
                      </span>
                    </div>
                    <span>
                      Provide strategic recommendations to senior management
                      based on committee findings.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                <div className="flex items-center mb-3">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <Scale className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Policy & Compliance
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-green-800">
                        1
                      </span>
                    </div>
                    <span>
                      Ensure all committee decisions are fully documented and in
                      compliance with company policy.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-green-800">
                        2
                      </span>
                    </div>
                    <span>
                      Act as the final internal authority on any policy
                      exceptions.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-green-800">
                        3
                      </span>
                    </div>
                    <span>
                      Review and approve all changes to the company&apos;s
                      lending policy.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                <div className="flex items-center mb-3">
                  <div className="bg-red-100 p-2 rounded-lg mr-3">
                    <Users className="h-5 w-5 text-red-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Team Leadership
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-red-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-red-800">1</span>
                    </div>
                    <span>
                      Mentor and guide committee members to ensure consistent
                      decision-making.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-red-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-red-800">2</span>
                    </div>
                    <span>
                      Address any internal disputes or procedural issues within
                      the committee.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-red-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-red-800">3</span>
                    </div>
                    <span>
                      Conduct regular performance reviews for all committee
                      members.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </>
      )}

      {session.user.role === "ADMIN" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            {/* User Management Card */}
            <Link href="/dashboard/user">
              <Card className="border-2 border-blue-300 hover:border-blue-500 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    User Management
                  </CardTitle>
                  <svg
                    className="h-5 w-5 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    Manage Users
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Create, edit, and manage system users
                  </p>
                  <div className="flex items-center mt-3">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Admin only
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* User Registration Card */}
            <Link href="/dashboard/register">
              <Card className="border-2 border-green-300 hover:border-green-500 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    User Registration
                  </CardTitle>
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    Register Users
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Add new users to the system
                  </p>
                  <div className="flex items-center mt-3">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Admin Only
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-3 rounded-xl mr-4 shadow-md">
                  <UserCog className="h-6 w-6 text-gray-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    System Administrator Guidelines
                  </h3>
                  <p className="text-gray-600">
                    System management, user administration, and security
                    oversight
                  </p>
                </div>
              </div>
              <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-3 py-1">
                Updated Today
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="bg-gray-100 p-2 rounded-lg mr-3">
                    <UserCog className="h-5 w-5 text-gray-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    User & Access Management
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-gray-800">1</span>
                    </div>
                    <span>
                      Create and manage user accounts and assign appropriate
                      roles and permissions.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-gray-800">2</span>
                    </div>
                    <span>
                      Deactivate user accounts promptly upon employee
                      termination or role change.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-gray-800">3</span>
                    </div>
                    <span>
                      Regularly audit user access logs to ensure compliance and
                      prevent unauthorized access.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Server className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    System Maintenance & Monitoring
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-blue-800">1</span>
                    </div>
                    <span>
                      Monitor system performance and address any uptime or
                      latency issues immediately.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-blue-800">2</span>
                    </div>
                    <span>
                      Schedule and oversee system updates and patches during
                      off-peak hours.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-blue-800">3</span>
                    </div>
                    <span>
                      Manage regular data backups to ensure business continuity.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                <div className="flex items-center mb-3">
                  <h4 className="font-semibold text-gray-800">
                    Security & Compliance
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-green-800">
                        1
                      </span>
                    </div>
                    <span>
                      Enforce strong password policies and multi-factor
                      authentication for all users.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-green-800">
                        2
                      </span>
                    </div>
                    <span>
                      Monitor for and respond to security threats and
                      vulnerabilities.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-green-800">
                        3
                      </span>
                    </div>
                    <span>
                      Ensure all system operations adhere to relevant data
                      protection and financial regulations.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                <div className="flex items-center mb-3">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <BarChart2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Reporting & Analytics
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-purple-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-purple-800">
                        1
                      </span>
                    </div>
                    <span>
                      Generate regular reports on system usage, performance, and
                      user activity.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-purple-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-purple-800">
                        2
                      </span>
                    </div>
                    <span>
                      Analyze system data to identify potential bottlenecks and
                      areas for improvement.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-purple-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-purple-800">
                        3
                      </span>
                    </div>
                    <span>
                      Provide executive summaries on system health and security
                      to senior management.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
      {session.user.role === "RELATIONSHIP_MANAGER" && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>All Applications</CardTitle>
              <div className="flex items-center gap-2">
                <>
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border rounded-md p-2 text-sm"
                  >
                    <option value="all">All Applications</option>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </>

                <span className="text-sm font-normal text-gray-500">
                  {filteredCustomers.length} application(s)
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-600">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>{error}</p>
                  <Button onClick={fetchCustomers} className="mt-4">
                    Try Again
                  </Button>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>No applications found</p>

                  <Link href="/dashboard/fetch">
                    <Button className="mt-4">Create First Application</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-medium text-lg">
                            {customer.customerNumber?.startsWith("COMP")
                              ? customer.companyName
                              : `${customer.firstName} ${customer.lastName}`}
                          </p>

                          <Badge
                            className={getStatusBadge(
                              customer.applicationStatus
                            )}
                          >
                            {formatStatusText(customer.applicationStatus)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Loan: </span>
                            {customer.loanType}
                          </div>
                          <div>
                            <span className="font-medium">Amount: </span>
                            {formatCurrency(customer.loanAmount)}
                          </div>
                          <div>
                            <span className="font-medium">Applied: </span>
                            {formatDate(customer.createdAt)}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          <span className="font-medium">Ref: </span>
                          {customer.applicationReferenceNumber}
                          {customer.email && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="font-medium">Email: </span>
                              {customer.email}
                            </>
                          )}
                          <span className="mx-2">•</span>
                          <span className="font-medium">Phone: </span>
                          {customer.phone}
                        </div>
                      </div>
                      <Link href={`/dashboard/manage`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-3 rounded-xl mr-4 shadow-md">
                  <Handshake className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Relationship Manager Guidelines
                  </h3>
                  <p className="text-gray-600">
                    Client engagement and application submission best practices
                  </p>
                </div>
              </div>
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 px-3 py-1">
                Updated Today
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                <div className="flex items-center mb-3">
                  <div className="bg-orange-100 p-2 rounded-lg mr-3">
                    <UserPlus className="h-5 w-5 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Client Onboarding & Applications
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-orange-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-orange-800">
                        1
                      </span>
                    </div>
                    <span>
                      Ensure all client applications are complete and accurately
                      filled out.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-orange-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-orange-800">
                        2
                      </span>
                    </div>
                    <span>
                      Verify that all required supporting documents are attached
                      before submission.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-orange-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-orange-800">
                        3
                      </span>
                    </div>
                    <span>
                      Educate clients on the loan process and set realistic
                      expectations for timelines.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                <div className="flex items-center mb-3">
                  <div className="bg-teal-100 p-2 rounded-lg mr-3">
                    <MessageSquare className="h-5 w-5 text-teal-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Communication & Follow-up
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-teal-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-teal-800">1</span>
                    </div>
                    <span>
                      Provide timely updates to clients on their application
                      status.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-teal-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-teal-800">2</span>
                    </div>
                    <span>
                      Respond to client inquiries within **2 business hours**.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-teal-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-teal-800">3</span>
                    </div>
                    <span>
                      Maintain a professional and empathetic tone in all client
                      interactions.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-cyan-50 p-5 rounded-xl border border-cyan-100">
                <div className="flex items-center mb-3">
                  <div className="bg-cyan-100 p-2 rounded-lg mr-3">
                    <TrendingUp className="h-5 w-5 text-cyan-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Sales & Business Development
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-cyan-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-cyan-800">1</span>
                    </div>
                    <span>
                      Actively seek new leads and business opportunities to grow
                      the loan portfolio.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-cyan-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-cyan-800">2</span>
                    </div>
                    <span>
                      Cross-sell additional products and services to existing
                      clients.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-cyan-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-cyan-800">3</span>
                    </div>
                    <span>
                      Maintain a target of **5 new client meetings** per week.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                <div className="flex items-center mb-3">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                    <Network className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">
                    Internal Collaboration
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-indigo-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-indigo-800">
                        1
                      </span>
                    </div>
                    <span>
                      Serve as the primary liaison between the client and the
                      credit analysis team.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-indigo-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-indigo-800">
                        2
                      </span>
                    </div>
                    <span>
                      Clearly communicate any client concerns or specific needs
                      to the team.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-indigo-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold text-indigo-800">
                        3
                      </span>
                    </div>
                    <span>
                      Proactively coordinate with analysts to gather updates on
                      application progress.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Dashen Bank. All rights reserved.
          </div>
        </>
      )}

      {session.user.role === "BANNED" && (
        <div className="min-h-screen flex items-start justify-center bg-gray-50 sm:p-6">
          <title>Account Disabled</title>
          <Card className="w-full max-w-2xl bg-white rounded-xl shadow-lg border-0">
            <CardHeader className="text-center space-y-2 p-6 bg-red-50 rounded-t-xl">
              <Ban className="h-16 w-16 text-red-500 mx-auto" />
              <CardTitle className="text-2xl font-bold text-red-800">
                Account Disabled
              </CardTitle>
              <CardDescription className="text-red-700">
                Your access to this system has been suspended.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-gray-600">
                This action may have been taken due to a violation of our terms
                of service or security protocols. Please contact support for
                more information and assistance with your account.
              </p>
              <p>For more information communicate the system admin </p>
            </CardContent>
            <CardFooter>
              <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Dashen Bank. All rights
                reserved.
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
