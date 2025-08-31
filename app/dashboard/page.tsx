"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  RefreshCw
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
}

export default function Dashboard() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function getSession() {
      try {
        const { data, error } = await authClient.getSession();
        
        if (error || !data) {
          router.push("/login");
          return;
        }

        setSession(data as unknown as UserSession);
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
      const response = await fetch('/api/manage');
      
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
      committe_reversed: "bg-rose-100 text-rose-800"
    };
    return variants[safeStatus as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const formatStatusText = (status: string = "") => {
    const statusMap: Record<string, string> = {
      pending: "PENDING",
      approved: "APPROVED",
      rejected: "REJECTED",
      under_review: "UNDER REVIEW",
      committee_review: "COMMITTEE REVIEW",
      supervised: "SUPERVISED",
      analysis_completed: "ANALYSIS COMPLETED",
      rm_recomendation: "RM RECOMMENDATION",
      supervisor_reviewing: "SUPERVISOR REVIEWING",
      final_analysis: "FINAL ANALYSIS",
      member_review: "MEMBER REVIEW",
      committe_reversed: "COMMITTEE REVERSED"
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
    const pending = customers.filter(c => c.applicationStatus.toLowerCase().includes('pending')).length;
    const approved = customers.filter(c => c.applicationStatus.toLowerCase() === 'approved').length;
    const rejected = customers.filter(c => c.applicationStatus.toLowerCase() === 'rejected').length;

    return { total, pending, approved, rejected };
  };

  const stats = getStats();

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
      <title>Customer Dashboard | Loan System</title>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Applications
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and review all customer applications
          </p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={fetchCustomers} 
            variant="outline" 
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/clients/create">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Application
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
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

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Applications</span>
            <span className="text-sm font-normal text-gray-500">
              {customers.length} application(s)
            </span>
          </CardTitle>
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
          ) : customers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>No applications found</p>
              <Link href="/clients/create">
                <Button className="mt-4">Create First Application</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {customers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium text-lg">
                        {customer.firstName} {customer.lastName}
                      </p>
                      <Badge className={getStatusBadge(customer.applicationStatus)}>
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
                  <Link href={`/applications/${customer.applicationReferenceNumber}`}>
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
    </div>
  );
}