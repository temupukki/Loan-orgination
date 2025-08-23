"use client";

import { useState, useEffect } from "react";
import { loanApi, LoanApplication } from "@/lib/api/loan";
import { formatAddress, formatCurrency } from "@/app/utils/formatters";
import { formatDateForDisplay } from "../utils/dateUtils";

interface ReviewDecision {
  applicationId: string;
  decision: "approved" | "rejected" | "pending";
  notes: string;
  conditions?: string[];
  approvedAmount?: number;
  approvedTerm?: number;
}

export default function LoanReviewDashboard() {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState<ReviewDecision>({
    applicationId: "",
    decision: "pending",
    notes: "",
    conditions: [],
    approvedAmount: 0,
    approvedTerm: 0
  });

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await loanApi.getApplications({ status: "pending", limit: 50 });
      setApplications(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleSelectApplication = (application: LoanApplication) => {
    setSelectedApplication(application);
    setDecision({
      applicationId: application.id,
      decision: "pending",
      notes: "",
      conditions: [],
      approvedAmount: application.loanAmount || 0,
      approvedTerm: application.loanPeriod || 0
    });
  };

  const handleDecisionSubmit = async () => {
    if (!selectedApplication) return;
    
    setReviewing(true);
    try {
      // API call to update application status
 
      
      // Refresh applications list
      await fetchApplications();
      setSelectedApplication(null);
      setDecision({
        applicationId: "",
        decision: "pending",
        notes: "",
        conditions: [],
        approvedAmount: 0,
        approvedTerm: 0
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setReviewing(false);
    }
  };

  const addCondition = () => {
    setDecision(prev => ({
      ...prev,
      conditions: [...(prev.conditions || []), ""]
    }));
  };

  const updateCondition = (index: number, value: string) => {
    setDecision(prev => ({
      ...prev,
      conditions: prev.conditions?.map((cond, i) => i === index ? value : cond) || []
    }));
  };

  const removeCondition = (index: number) => {
    setDecision(prev => ({
      ...prev,
      conditions: prev.conditions?.filter((_, i) => i !== index) || []
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading applications for review...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Loan Application Review</h1>
          <p className="text-gray-600">Review and make decisions on pending loan applications</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Pending Applications ({applications.length})</h2>
            
            <div className="space-y-3">
              {applications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending applications for review
                </div>
              ) : (
                applications.map((application) => (
                  <div
                    key={application.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedApplication?.id === application.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => handleSelectApplication(application)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">
                          {application.firstName} {application.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{application.customerNumber}</p>
                        <p className="text-sm">
                          Requested: {formatCurrency(application.loanAmount || 0)}
                        </p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        PENDING
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Applied: {formatDateForDisplay(application.applicationDate || "")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Application Review Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {selectedApplication ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Review Application</h2>
                
                {/* Customer Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <p className="font-medium">
                        {selectedApplication.firstName} {selectedApplication.lastName}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Customer #:</span>
                      <p className="font-medium">{selectedApplication.customerNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Monthly Income:</span>
                      <p className="font-medium">
                        {formatCurrency(selectedApplication.monthlyIncome || 0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <p className="font-medium">
                        {formatAddress(selectedApplication)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Loan Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Loan Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Requested Amount:</span>
                      <p className="font-medium">
                        {formatCurrency(selectedApplication.loanAmount || 0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Loan Type:</span>
                      <p className="font-medium">{selectedApplication.loanType || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Term:</span>
                      <p className="font-medium">
                        {selectedApplication.loanPeriod ? `${selectedApplication.loanPeriod} months` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Purpose:</span>
                      <p className="font-medium">{selectedApplication.purposeOfLoan || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Decision Panel */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Decision</h3>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <button
                      onClick={() => setDecision(prev => ({ ...prev, decision: "approved" }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        decision.decision === "approved"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => setDecision(prev => ({ ...prev, decision: "rejected" }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        decision.decision === "rejected"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 hover:border-red-300"
                      }`}
                    >
                      ❌ Reject
                    </button>
                    <button
                      onClick={() => setDecision(prev => ({ ...prev, decision: "pending" }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        decision.decision === "pending"
                          ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                          : "border-gray-200 hover:border-yellow-300"
                      }`}
                    >
                      ⏳ More Info Needed
                    </button>
                  </div>

                  {decision.decision === "approved" && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <h4 className="font-medium mb-2">Approval Details</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Approved Amount</label>
                          <input
                            type="number"
                            value={decision.approvedAmount}
                            onChange={(e) => setDecision(prev => ({ 
                              ...prev, 
                              approvedAmount: Number(e.target.value) 
                            }))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Term (months)</label>
                          <input
                            type="number"
                            value={decision.approvedTerm}
                            onChange={(e) => setDecision(prev => ({ 
                              ...prev, 
                              approvedTerm: Number(e.target.value) 
                            }))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Conditions */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm text-gray-600">Conditions</label>
                      <button
                        type="button"
                        onClick={addCondition}
                        className="text-blue-600 text-sm hover:text-blue-800"
                      >
                        + Add Condition
                      </button>
                    </div>
                    {decision.conditions?.map((condition, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={condition}
                          onChange={(e) => updateCondition(index, e.target.value)}
                          placeholder="Condition requirement"
                          className="flex-1 p-2 border border-gray-300 rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeCondition(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">Review Notes</label>
                    <textarea
                      value={decision.notes}
                      onChange={(e) => setDecision(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add your review notes and comments..."
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleDecisionSubmit}
                      disabled={reviewing}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
                    >
                      {reviewing ? "Processing..." : "Submit Decision"}
                    </button>
                    <button
                      onClick={() => setSelectedApplication(null)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium mb-2">Select an Application</h3>
                <p>Choose a pending application from the list to begin review</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">0</div>
            <div className="text-sm text-gray-600">Reviewed Today</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Approved Today</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">0</div>
            <div className="text-sm text-gray-600">Rejected Today</div>
          </div>
        </div>
      </div>
    </div>
  );
}