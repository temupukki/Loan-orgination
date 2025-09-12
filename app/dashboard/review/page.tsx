"use client";

import { useState, useEffect } from "react";
import { Customer, CompanyCustomer } from "@/app/types/loan";
import { formatCurrency } from "@/app/utils/formatters";
import { formatDateForDisplay } from "../../utils/dateUtils";

export default function ReviewPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [company, setCompany] = useState<CompanyCustomer | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const customerData = localStorage.getItem("currentCustomer");
    if (customerData) {
      const customerObj = JSON.parse(customerData);

      // Set today's date as application date if not already set
      if (!customerObj.applicationDate) {
        customerObj.applicationDate = new Date().toISOString();
      }

      // Generate application reference number if not already set
      if (!customerObj.applicationReferenceNumber) {
        customerObj.applicationReferenceNumber = generateApplicationReference();
      }

      setCustomer(customerObj);
      localStorage.setItem("currentCustomer", JSON.stringify(customerObj));
    } else {
      window.location.href = "/dashboard";
    }
  }, []);

const generateApplicationReference = (): string => {
  const prefix = "DASHEN";
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${year}${month}-${random}`;
};
// Example: DASHEN-202412-5837

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
      localStorage.removeItem("currentCustomer");

      // Redirect to home after 2 seconds
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    window.location.href = "/dashboard/documents";
  };

  const getDocumentStatus = (url: string | undefined): string => {
    return url ? "✅ Uploaded" : "❌ Missing";
  };

  const openDocument = (url: string) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  if (!customer)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Review Application
          </h1>

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

          {/* Application Reference & Status */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-blue-800">
                  Application Reference:
                </strong>
                <p className="text-lg font-mono text-blue-600">
                  {customer.applicationReferenceNumber}
                </p>
              </div>
              <div>
                <strong className="text-blue-800">Application Date:</strong>
                <p className="text-lg text-blue-600">
                  {formatDateForDisplay(customer.applicationDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Customer Information */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Customer Information
                </h3>
                {customer.customerNumber?.startsWith("COMP") ? (
                  <div>
                    <strong>Company Name:</strong>{" "}
                    {customer.companyName || "Not provided"}
                  </div>
                ) : (
                  <div>
                    <strong>Name:</strong> {customer.firstName}{" "}
                    {customer.middleName} {customer.lastName}
                  </div>
                )}
                <div>
                  <strong>Customer Number:</strong> {customer.customerNumber}
                </div>
                <div>
                  <strong>TIN Number:</strong> {customer.tinNumber}
                </div>
                <div>
                  <strong>Email:</strong> {customer.email}
                </div>
                <div>
                  <strong>Phone:</strong> {customer.phone}
                </div>
                <div>
                  <strong>
                    {customer.customerNumber?.startsWith("COMP")
                      ? "Annual Revenue:"
                      : "Monthly Income:"}
                  </strong>{" "}
                  {formatCurrency(
                    customer.customerNumber?.startsWith("COMP")
                      ? customer.annualRevenue || 0
                      : customer.monthlyIncome || 0
                  )}
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <strong>Customer Segmentation:</strong>{" "}
                  {customer.customerSegmentation || "Not provided"}
                </div>
                <div>
                  <strong>Credit Initiation Center:</strong>{" "}
                  {customer.creditInitiationCenter || "Not provided"}
                </div>
                <div>
                  <strong>Economic Sector:</strong>{" "}
                  {customer.economicSector || "Not provided"}
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Business Information
              </h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <strong>Major Business:</strong>{" "}
                  {customer.majorLineBusiness || "Not provided"}
                </div>
                <div>
                  <strong>Establishment Date:</strong>{" "}
                  {customer.dateOfEstablishmentMLB
                    ? formatDateForDisplay(customer.dateOfEstablishmentMLB)
                    : "Not provided"}
                </div>
                <div>
                  <strong>Other Business:</strong>{" "}
                  {customer.otherLineBusiness || "Not provided"}
                </div>
                {customer.dateOfEstablishmentOLB && (
                  <div>
                    <strong>Establishment Date:</strong>{" "}
                    {formatDateForDisplay(customer.dateOfEstablishmentOLB)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Loan Details & Documents */}
          <div className="space-y-6">
            {/* Loan Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Loan Details
              </h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <strong>Loan Type:</strong>{" "}
                  {customer.loanType || "Not provided"}
                </div>
                <div>
                  <strong>Loan Amount:</strong>{" "}
                  {customer.loanAmount
                    ? formatCurrency(customer.loanAmount)
                    : "Not provided"}
                </div>
                <div>
                  <strong>Loan Period:</strong>{" "}
                  {customer.loanPeriod
                    ? `${customer.loanPeriod} months`
                    : "Not provided"}
                </div>
                <div>
                  <strong>Repayment Mode:</strong>{" "}
                  {customer.modeOfRepayment || "Not provided"}
                </div>
                <div>
                  <strong>Purpose:</strong>{" "}
                  {customer.purposeOfLoan || "Not provided"}
                </div>
              </div>
            </div>

            {/* Shareholders */}
            {customer.shareholders && customer.shareholders.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Shareholders
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                          Name
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                          Share Value
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customer.shareholders.map(
                        (shareholder: any, index: number) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm">
                              {shareholder.name}
                            </td>
                            <td className="px-3 py-2 text-sm">
                              {formatCurrency(shareholder.shareValue)}
                            </td>
                            <td className="px-3 py-2 text-sm">
                              {shareholder.sharePercentage}%
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Documents */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Documents
              </h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {!customer.customerNumber?.startsWith("COMP") && (
                  <div className="flex justify-between items-center">
                    <span>National ID Document:</span>
                    <span
                      className={`cursor-pointer ${
                        customer.nationalidUrl
                          ? "text-green-600 hover:underline"
                          : "text-red-600"
                      }`}
                      onClick={() =>
                        customer.nationalidUrl &&
                        openDocument(customer.nationalidUrl)
                      }
                    >
                      {getDocumentStatus(customer.nationalidUrl)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Agreement Form:</span>
                  <span
                    className={`cursor-pointer ${
                      customer.agreementFormUrl
                        ? "text-green-600 hover:underline"
                        : "text-red-600"
                    }`}
                    onClick={() =>
                      customer.agreementFormUrl &&
                      openDocument(customer.agreementFormUrl)
                    }
                  >
                    {getDocumentStatus(customer.agreementFormUrl)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Application Form:</span>
                  <span
                    className={`cursor-pointer ${
                      customer.applicationFormUrl
                        ? "text-green-600 hover:underline"
                        : "text-red-600"
                    }`}
                    onClick={() =>
                      customer.applicationFormUrl &&
                      openDocument(customer.applicationFormUrl)
                    }
                  >
                    {getDocumentStatus(customer.applicationFormUrl)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Credit Profile:</span>
                  <span
                    className={`cursor-pointer ${
                      customer.creditProfileUrl
                        ? "text-green-600 hover:underline"
                        : "text-red-600"
                    }`}
                    onClick={() =>
                      customer.creditProfileUrl &&
                      openDocument(customer.creditProfileUrl)
                    }
                  >
                    {getDocumentStatus(customer.creditProfileUrl)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Transaction Profile:</span>
                  <span
                    className={`cursor-pointer ${
                      customer.transactionProfileUrl
                        ? "text-green-600 hover:underline"
                        : "text-red-600"
                    }`}
                    onClick={() =>
                      customer.transactionProfileUrl &&
                      openDocument(customer.transactionProfileUrl)
                    }
                  >
                    {getDocumentStatus(customer.transactionProfileUrl)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Collateral Profile:</span>
                  <span
                    className={`cursor-pointer ${
                      customer.collateralProfileUrl
                        ? "text-green-600 hover:underline"
                        : "text-red-600"
                    }`}
                    onClick={() =>
                      customer.collateralProfileUrl &&
                      openDocument(customer.collateralProfileUrl)
                    }
                  >
                    {getDocumentStatus(customer.collateralProfileUrl)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Financial Profile:</span>
                  <span
                    className={`cursor-pointer ${
                      customer.financialProfileUrl
                        ? "text-green-600 hover:underline"
                        : "text-red-600"
                    }`}
                    onClick={() =>
                      customer.financialProfileUrl &&
                      openDocument(customer.financialProfileUrl)
                    }
                  >
                    {getDocumentStatus(customer.financialProfileUrl)}
                  </span>
                </div>
                {customer.majorLineBusinessUrl && (
                  <div className="flex justify-between items-center">
                    <span>Major Business Document:</span>
                    <span
                      className="cursor-pointer text-green-600 hover:underline"
                      onClick={() =>
                        openDocument(customer.majorLineBusinessUrl!)
                      }
                    >
                      ✅ Uploaded
                    </span>
                  </div>
                )}
                {customer.otherLineBusinessUrl && (
                  <div className="flex justify-between items-center">
                    <span>Other Business Document:</span>
                    <span
                      className="cursor-pointer text-green-600 hover:underline"
                      onClick={() =>
                        openDocument(customer.otherLineBusinessUrl!)
                      }
                    >
                      ✅ Uploaded
                    </span>
                  </div>
                )}
                {customer.shareholdersDetailsUrl && (
                  <div className="flex justify-between items-center">
                    <span>Shareholders Details:</span>
                    <span
                      className="cursor-pointer text-green-600 hover:underline"
                      onClick={() =>
                        openDocument(customer.shareholdersDetailsUrl!)
                      }
                    >
                      ✅ Uploaded
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={goBack}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Back to Documents
          </button>
          <button
            onClick={saveCustomerToDB}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "Submitting Application..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}
