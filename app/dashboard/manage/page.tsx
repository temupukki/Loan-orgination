"use client";

import { useState, useEffect } from "react";

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

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loanTypeFilter, setLoanTypeFilter] = useState("all");

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, statusFilter, loanTypeFilter]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/manage");
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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

    setFilteredCustomers(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      UNDER_REVIEW: "bg-blue-100 text-blue-800",
      COMMITTEE_REVIEW: "bg-purple-100 text-purple-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-lg text-gray-600 mt-4">Loading customers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-red-600 text-lg">Error: {error}</p>
        <button
          onClick={fetchCustomers}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Customer Management 👥
        </h1>
        <p className="text-gray-600 mt-2">
          Manage and review all customer applications
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Search</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Status Filter</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="COMMITTEE_REVIEW">Committee Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Loan Type Filter</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={loanTypeFilter}
            onChange={(e) => setLoanTypeFilter(e.target.value)}
          >
            <option value="all">All Loan Types</option>
            {getUniqueLoanTypes().map((lt) => (
              <option key={lt} value={lt}>
                {lt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Customer Applications</h2>
            <p className="text-sm text-gray-500">
              {filteredCustomers.length} application(s) found
            </p>
          </div>
          <button
            onClick={fetchCustomers}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="text-center p-12">
            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              No customers found
            </h3>
            <p className="text-gray-600 mt-2">
              {customers.length === 0
                ? "No customer applications in the system yet."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Reference #</th>
                  <th className="border px-4 py-2 text-left">Customer</th>
                  <th className="border px-4 py-2 text-left">Contact</th>
                  <th className="border px-4 py-2 text-left">Loan Details</th>
                  <th className="border px-4 py-2 text-left">Status</th>
                  <th className="border px-4 py-2 text-left">Date Applied</th>
                  <th className="border px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">
                      {c.applicationReferenceNumber}
                    </td>
                    <td className="border px-4 py-2">
                      <div className="font-medium">
                        {c.firstName} {c.middleName} {c.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {c.customerNumber}
                      </div>
                    </td>
                    <td className="border px-4 py-2">
                      <div>{c.phone}</div>
                      <div className="text-xs text-gray-500">
                        {c.email || "No email"}
                      </div>
                    </td>
                    <td className="border px-4 py-2">
                      <div className="font-medium">{c.loanType}</div>
                      <div className="text-xs">{formatCurrency(c.loanAmount)}</div>
                    </td>
                    <td className="border px-4 py-2">
                      {getStatusBadge(c.applicationStatus)}
                    </td>
                    <td className="border px-4 py-2">{formatDate(c.createdAt)}</td>
                    <td className="border px-4 py-2">
                      <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
