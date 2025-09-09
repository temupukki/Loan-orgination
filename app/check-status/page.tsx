"use client";

import { useState, useEffect } from "react";
import {
  Search,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Phone,
  Mail,
  FileText,
  Calendar,
  MapPin,
  CreditCard,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Customer {
  id: string;
  applicationReferenceNumber: string;
  customerNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone: string;
  email?: string;
  loanAmount: number;
  loanType: string;
  applicationStatus: string;
  decisionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface Decision {
  responsibleUnitEmail: string;
  responsibleUnitPhone: string;
  responsibleUnitName: string;
  id: string;
  customerId: string;
  applicationReferenceNumber: string;
  decision: string;
  decisionReason: string;
  committeeMember: string;
  decisionDate: string;
}

export default function CustomerSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);

  const searchCustomer = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter an application reference number");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCustomer(null);
    setDecision(null);

    try {
      const response = await fetch(`/api/manage?ref=${encodeURIComponent(searchTerm.trim())}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Application not found with this reference number");
        }
        throw new Error("Failed to search for application");
      }
      
      const customerData: Customer = await response.json();
      setCustomer(customerData);

      if (customerData.applicationStatus === "APPROVED" || 
          customerData.applicationStatus === "REJECTED") {
        await fetchDecision(customerData.applicationReferenceNumber);
      }
      
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDecision = async (applicationRef: string) => {
    try {
      const response = await fetch(`/api/decision/${applicationRef}`);
      if (response.ok) {
        const decisionData: Decision = await response.json();
        setDecision(decisionData);
      }
    } catch (err) {
      console.error("Failed to fetch decision:", err);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      UNDER_REVIEW: "bg-blue-100 text-blue-800 border border-blue-300",
      COMMITTEE_REVIEW: "bg-purple-100 text-purple-800 border border-purple-300",
      APPROVED: "bg-green-100 text-green-800 border border-green-300",
      REJECTED: "bg-red-100 text-red-800 border border-red-300",
    };

    const statusLabels: Record<string, string> = {
      PENDING: "Pending",
      UNDER_REVIEW: "Under Review",
      RM_RECCOMENDATION: "RM Recommendation",
      SUPERVISOR_REVIEWING: "Supervisor Reviewing",
      SUPERVISED: "Supervised",
      FINAL_ANALYSIS: "Final Analysis",
      MEMBER_REVIEW: "Committee Review",
      COMMITTEE_REVIEW: "Committee Review",
      COMMITTE_REVERSED: "Committee Reversed",
      APPROVED: "Approved",
      REJECTED: "Rejected",
    };

    const className = statusClasses[status] || "bg-gray-100 text-gray-800 border border-gray-300";
    const label = statusLabels[status] || status;

    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${className}`}>
        {label}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCustomer(null);
    setDecision(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <Image
                src="/dashen logo.png"
                alt="Dashen Bank"
                width={120}
                height={60}
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Loan Application Tracker
          </h1>
          <p className="text-gray-600 text-lg">
            Check your loan application status anytime, anywhere
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Track Your Application
            </h2>
            <p className="text-gray-500">
              Enter your application reference number to check the status
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Application Reference Number
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g., DASHEN-123456-123"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchCustomer()}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg placeholder-gray-400"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={searchCustomer}
                disabled={isLoading}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
                {isLoading ? "Searching..." : "Search"}
              </button>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-xl transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Searching for your application
            </h3>
            <p className="text-gray-500">
              Please wait while we retrieve your application details...
            </p>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-red-500">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="h-6 w-6 flex-shrink-0" />
              <h3 className="text-lg font-semibold">Application Not Found</h3>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">
                💡 Please ensure you've entered the correct reference number. 
                If you need assistance, please contact our support team.
              </p>
            </div>
          </div>
        )}

        {customer && !isLoading && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Application Details</h2>
                  <p className="text-blue-100">Reference: {customer.applicationReferenceNumber}</p>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 self-start">
                  {getStatusIcon(customer.applicationStatus)}
                  {getStatusBadge(customer.applicationStatus)}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Customer Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Full Name:</span>
                      <span className="font-medium text-gray-900">
                        {customer.firstName} {customer.middleName} {customer.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Customer ID:</span>
                      <span className="font-mono text-gray-900">{customer.customerNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-900">{customer.phone}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">{customer.email || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loan Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Loan Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Loan Type:</span>
                      <span className="font-medium text-gray-900">{customer.loanType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Loan Amount:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(customer.loanAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Application Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Applied On:</span>
                      <span className="font-medium text-gray-900">{formatDate(customer.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium text-gray-900">{formatDate(customer.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decision Details */}
              {(customer.applicationStatus === "APPROVED" || 
                customer.applicationStatus === "REJECTED") && decision && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-5 border border-green-200">
                  <h3 className={`font-semibold mb-4 flex items-center gap-2 ${
                    customer.applicationStatus === "APPROVED" 
                      ? "text-green-700" 
                      : "text-red-700"
                  }`}>
                    <BadgeCheck className="h-5 w-5" />
                    {customer.applicationStatus === "APPROVED" 
                      ? "Approval Details" 
                      : "Rejection Details"}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-700">Decision Reason:</span>
                      <p className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                        {decision.decisionReason}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Decision Date:</span>
                        <span className="font-medium text-gray-900">{formatDate(decision.decisionDate)}</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        Responsible Committee Manager
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {decision.responsibleUnitName}</p>
                        <p><strong>Email:</strong> {decision.responsibleUnitEmail}</p>
                        <p><strong>Phone:</strong> {decision.responsibleUnitPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {customer.applicationStatus === "PENDING" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 text-yellow-800 mb-3">
                    <Clock className="h-6 w-6" />
                    <span className="font-semibold">Application is Pending Review</span>
                  </div>
                  <p className="text-yellow-700">
                    Your application has been received and is currently in the queue for processing. 
                    Our team will review it shortly. Please check back later for updates.
                  </p>
                </div>
              )}

              {customer.applicationStatus === "UNDER_REVIEW" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 text-blue-800 mb-3">
                    <AlertCircle className="h-6 w-6" />
                    <span className="font-semibold">Application Under Review</span>
                  </div>
                  <p className="text-blue-700">
                    Your application is currently being reviewed by our team. 
                    This process may take a few days. We appreciate your patience.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {!customer && !isLoading && !error && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ready to Check Your Application?
            </h3>
            <p className="text-gray-500 mb-6">
              Enter your application reference number in the search field above to get started.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-700">
                📋 Your reference number can be found in your application confirmation email or document.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Dashen Bank. All rights reserved.
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Secure application tracking system
          </p>
        </div>
      </div>
    </div>
  );
}