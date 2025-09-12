"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  X,
  Calendar,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loanTypeFilter, setLoanTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [isRelationshipManager, setIsRelationshipManager] = useState(false);

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
        if (data.user.role === "RELATIONSHIP_MANAGER") {
          setIsRelationshipManager(true);
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
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, statusFilter, loanTypeFilter, dateFilter]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/manage");
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      const data = await response.json();
      setCustomers(data);

      // Fetch decisions for both approved and rejected applications
      const decidedCustomers = data.filter(
        (c: Customer) =>
          c.applicationStatus === "APPROVED" ||
          c.applicationStatus === "REJECTED"
      );

      for (const customer of decidedCustomers) {
        await fetchDecision(customer.applicationReferenceNumber);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDecision = async (applicationRef: string) => {
    try {
      const response = await fetch(`/api/decision/${applicationRef}`);
      if (response.ok) {
        const decisionData = await response.json();
        setDecisions((prev) => ({
          ...prev,
          [applicationRef]: decisionData,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch decision:", err);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.applicationReferenceNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          c.customerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.applicationStatus === statusFilter);
    }

    if (loanTypeFilter !== "all") {
      filtered = filtered.filter((c) => c.loanType === loanTypeFilter);
    }

    // Date filtering logic - filter by exact day applied
    if (dateFilter) {
      const selectedDate = new Date(dateFilter);
      filtered = filtered.filter((c) => {
        const applicationDate = new Date(c.createdAt);
        return (
          applicationDate.getFullYear() === selectedDate.getFullYear() &&
          applicationDate.getMonth() === selectedDate.getMonth() &&
          applicationDate.getDate() === selectedDate.getDate()
        );
      });
    }

    setFilteredCustomers(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      PENDING: "bg-gray-100 text-gray-800 border border-gray-300",
      UNDER_REVIEW: "bg-blue-100 text-blue-800 border border-blue-300",
      COMMITTEE_REVIEW:
        "bg-purple-100 text-purple-800 border border-purple-300",
      APPROVED: "bg-green-100 text-green-800 border border-green-300",
      REJECTED: "bg-red-100 text-red-800 border border-red-300",
    };

    const statusLabels: Record<string, string> = {
      PENDING: "Pending",
      UNDER_REVIEW: "Under Review",
      RM_RECCOMENDATION: "RM reccomendation",
      SUPERVISOR_REVIEWING: "Supervisor reviewing",
      SUPERVISED: "Supervised",
      FINAL_ANALYSIS: "Final analysis",
      MEMBER_REVIEW: "Committe member review ",
      COMMITTEE_REVIEW: "Committee Review",
      COMMITTE_REVERSED: "Committe reversed",
      APPROVED: "Approved",
      REJECTED: "Rejected",
    };

    const className =
      statusClasses[status] ||
      "bg-gray-100 text-gray-800 border border-gray-300";
    const label = statusLabels[status] || status;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}
      >
        {label}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getUniqueLoanTypes = () => {
    const loanTypes = customers.map((c) => c.loanType);
    return Array.from(new Set(loanTypes));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const closeDetails = () => {
    setSelectedCustomer(null);
  };

  const resetDateFilter = () => {
    setDateFilter("");
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

  // Don't render anything if not relationship manager (will redirect due to useEffect)
  if (!isRelationshipManager) {
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Error Loading Data
        </h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={fetchCustomers}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
      <title>Manage | Loan Orgination</title>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Customer Management
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Manage and review all customer applications
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium block">Search</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium block">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="RM_RECCOMENDATION">RM reccomendation</option>
              <option value="ANALYSIS_COMPLETED">Analysis completed</option>
              <option value="SUPERVISOR_REVIEWING">Supervisor reviewing</option>
              <option value="SUPERVISED">Supervised</option>
              <option value="FINAL_ANALYSIS">Final analysis</option>
              <option value="MEMBER_REVIEW">Member review</option>
              <option value="COMMITTEE_REVIEW">Committee Review</option>
              <option value="COMMITTE_REVERSED">Committe reversed</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              Loan Type Filter
            </label>
            <select
              value={loanTypeFilter}
              onChange={(e) => setLoanTypeFilter(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Loan Types</option>
              {getUniqueLoanTypes().map((lt) => (
                <option key={lt} value={lt}>
                  {lt}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium block">Date Applied</label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-8 w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {dateFilter && (
                <button
                  onClick={resetDateFilter}
                  className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  title="Clear date filter"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results count and refresh button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Customer Applications</h2>
          <p className="text-sm text-gray-500">
            {filteredCustomers.length} application(s) found
            {dateFilter && ` on ${new Date(dateFilter).toLocaleDateString()}`}
          </p>
        </div>
        <button
          onClick={fetchCustomers}
          className="mt-2 sm:mt-0 flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Table */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 flex flex-col items-center justify-center">
          <FileText className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            No applications found
          </h3>
          <p className="text-gray-500 text-center text-sm">
            {customers.length === 0
              ? "No customer applications in the system yet."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs sm:text-sm text-gray-500 uppercase tracking-wider">
                <th scope="col" className="p-3 font-semibold">
                  Reference #
                </th>
                <th scope="col" className="p-3 font-semibold">
                  Customer
                </th>
                <th scope="col" className="p-3 font-semibold">
                  Contact
                </th>
                <th scope="col" className="p-3 font-semibold">
                  Loan Details
                </th>
                <th scope="col" className="p-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="p-3 font-semibold">
                  Date Applied
                </th>
                <th scope="col" className="p-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-xs sm:text-sm">
                    {customer.applicationReferenceNumber}
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-xs sm:text-sm">
                      {customer.firstName} {customer.middleName}{" "}
                      {customer.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {customer.customerNumber}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-xs sm:text-sm">
                      <Phone size={14} />
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail size={14} />
                        {customer.email}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-xs sm:text-sm">
                      {customer.loanType}
                    </div>
                    <div className="text-xs">
                      {formatCurrency(customer.loanAmount)}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(customer.applicationStatus)}
                      {getStatusBadge(customer.applicationStatus)}
                    </div>
                  </td>
                  <td className="p-3 text-xs sm:text-sm">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      className="flex items-center justify-end gap-1 border border-gray-300 bg-white px-3 py-1 rounded-md text-sm hover:bg-gray-50 transition-colors"
                      onClick={() => viewCustomerDetails(customer)}
                    >
                      <Eye size={14} />
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto border-2 border-gray-300">
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h2 className="text-xl font-bold">Application Details</h2>
                <p className="text-gray-600 text-sm">
                  Reference: {selectedCustomer.applicationReferenceNumber}
                </p>
              </div>
              <button
                onClick={closeDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4 text-sm sm:text-base">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User size={16} />
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span>
                        {selectedCustomer.firstName}{" "}
                        {selectedCustomer.middleName}{" "}
                        {selectedCustomer.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Customer ID:</span>
                      <span>{selectedCustomer.customerNumber}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Phone size={16} />
                    Contact Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span>{selectedCustomer.email || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Loan Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span>{selectedCustomer.loanType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount:</span>
                      <span>{formatCurrency(selectedCustomer.loanAmount)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Application Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span>
                        {getStatusBadge(selectedCustomer.applicationStatus)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Applied On:</span>
                      <span>{formatDate(selectedCustomer.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Show decision details for both APPROVED and REJECTED applications */}
              {(selectedCustomer.applicationStatus === "APPROVED" ||
                selectedCustomer.applicationStatus === "REJECTED") &&
                decisions[selectedCustomer.applicationReferenceNumber] && (
                  <div>
                    <h3
                      className={`font-semibold mb-2 ${
                        selectedCustomer.applicationStatus === "APPROVED"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedCustomer.applicationStatus === "APPROVED"
                        ? "Approval Details"
                        : "Rejection Details"}
                    </h3>
                    <div
                      className={`p-3 rounded-md text-sm ${
                        selectedCustomer.applicationStatus === "APPROVED"
                          ? "bg-green-50"
                          : "bg-red-50"
                      }`}
                    >
                      <p className="font-medium mb-1">Reason:</p>
                      <p>
                        {
                          decisions[selectedCustomer.applicationReferenceNumber]
                            .decisionReason
                        }
                      </p>
                      <p className="font-medium mt-2 mb-1">Decision Date:</p>
                      <p>
                        {formatDate(
                          decisions[selectedCustomer.applicationReferenceNumber]
                            .decisionDate
                        )}
                      </p>
                      <p className="font-medium mt-2 mb-1">
                        Responsible Committee Manager:
                      </p>
                      <p>
                        <strong className="mr-2">Name: </strong>{" "}
                        {
                          decisions[selectedCustomer.applicationReferenceNumber]
                            .responsibleUnitName
                        }
                      </p>
                      <p>
                        <strong className="mr-2">Email: </strong>{" "}
                        {
                          decisions[selectedCustomer.applicationReferenceNumber]
                            .responsibleUnitEmail
                        }
                      </p>
                     
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}