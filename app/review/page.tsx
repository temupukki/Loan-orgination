"use client";

import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";
import { Customer } from "@/app/types/loan";
import { formatCurrency, formatDate } from "@/app/utils/formatters";

export default function ReviewPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const customerData = localStorage.getItem('currentCustomer');
    if (customerData) {
      setCustomer(JSON.parse(customerData));
    } else {
      window.location.href = '/';
    }
  }, []);

  const saveCustomerToDB = async () => {
    if (!customer) {
      setError("No customer data to save");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customer),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save customer");
      }

      const result = await res.json();
      setSuccess("Loan application submitted successfully!");
      
      // Clear localStorage after successful submission
      localStorage.removeItem('currentCustomer');
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    window.location.href = '/documents';
  };

  if (!customer) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Review Application</h1>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <div className="text-red-700">{error}</div>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
              <div className="text-green-700">{success}</div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {customer.firstName} {customer.middleName} {customer.lastName}</div>
                <div><strong>Customer Number:</strong> {customer.customerNumber}</div>
                <div><strong>TIN Number:</strong> {customer.tinNumber}</div>
                <div><strong>Email:</strong> {customer.email}</div>
                <div><strong>Phone:</strong> {customer.phone}</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Customer Segmentation:</strong> {customer.customerSegmentation || "Not provided"}</div>
                <div><strong>Credit Initiation Center:</strong> {customer.creditInitiationCenter || "Not provided"}</div>
                <div><strong>Economic Sector:</strong> {customer.economicSector || "Not provided"}</div>
                <div><strong>Application Date:</strong> {customer.applicationDate ? formatDate(customer.applicationDate) : "Not provided"}</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Business Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Major Business:</strong> {customer.majorLineBusiness || "Not provided"}</div>
                <div><strong>Other Business:</strong> {customer.otherLineBusiness || "Not provided"}</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Loan Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Loan Type:</strong> {customer.loanType || "Not provided"}</div>
                <div><strong>Loan Amount:</strong> {customer.loanAmount ? formatCurrency(customer.loanAmount) : "Not provided"}</div>
                <div><strong>Loan Period:</strong> {customer.loanPeriod ? `${customer.loanPeriod} months` : "Not provided"}</div>
                <div><strong>Repayment Mode:</strong> {customer.modeOfRepayment || "Not provided"}</div>
                <div><strong>Purpose:</strong> {customer.purposeOfLoan || "Not provided"}</div>
              </div>
            </div>

            {customer.shareholders && customer.shareholders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Shareholders</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Share Value</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customer.shareholders.map((shareholder: { name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; shareValue: number; sharePercentage: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, index: Key | null | undefined) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{shareholder.name}</td>
                          <td className="px-4 py-2">{formatCurrency(shareholder.shareValue)}</td>
                          <td className="px-4 py-2">{shareholder.sharePercentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={goBack}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={saveCustomerToDB}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50"
            >
              {saving ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}