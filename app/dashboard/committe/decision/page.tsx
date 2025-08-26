"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";

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
}

interface DecisionData {
  customerId: string;
  applicationReferenceNumber: string;
  decision: string;
  decisionReason?: string;
  committeeMember: string;
}

export default function CommitteeDecisionPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decisionReasons, setDecisionReasons] = useState<Record<string, string>>({});
  const [selectedDecisions, setSelectedDecisions] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchPendingCustomers = async () => {
      try {
    const response = await fetch(`/api/get?status=COMMITTE_REVIEW`);        if (!response.ok) {
          throw new Error("Failed to fetch pending customers");
        }
        const data = await response.json();
        setCustomers(data);
      } catch (err: any) {
        setError(err.message);
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingCustomers();
  }, []);

  const handleDecision = async (customerId: string, applicationRef: string) => {
    const decision = selectedDecisions[applicationRef];
    
    if (!decision) {
      toast.error("Please select a decision");
      return;
    }

    // For declined status, require a reason
    if (decision === 'REJECTED' && !decisionReasons[applicationRef]) {
      toast.error("Please provide a decision reason");
      return;
    }

    setIsSubmitting(prev => ({ ...prev, [applicationRef]: true }));

    try {
      // First, update the customer status with PATCH
      const patchResponse = await fetch(`/api/customer/${customerId}/decision`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision,
          decisionReason: decisionReasons[applicationRef] || ''
        }),
      });

      const patchData = await patchResponse.json();

      if (!patchResponse.ok) {
        throw new Error(patchData.error || 'Failed to update application status');
      }

      // Then, create a decision record with POST
      const decisionData: DecisionData = {
        customerId,
        applicationReferenceNumber: applicationRef,
        decision,
        decisionReason: decisionReasons[applicationRef] || '',
        committeeMember: "Current User" // Replace with actual user from auth context
      };

      const postResponse = await fetch('/api/decisions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(decisionData),
      });

      const postData = await postResponse.json();

      if (!postResponse.ok) {
        throw new Error(postData.error || 'Failed to save decision record');
      }

      // Remove the customer from the list if both operations succeeded
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      
      toast.success(`Decision submitted and recorded successfully`);
      
      // Clean up state
      setDecisionReasons(prev => {
        const newReasons = { ...prev };
        delete newReasons[applicationRef];
        return newReasons;
      });
      
      setSelectedDecisions(prev => {
        const newDecisions = { ...prev };
        delete newDecisions[applicationRef];
        return newDecisions;
      });

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(prev => ({ ...prev, [applicationRef]: false }));
    }
  };

  const handleReasonChange = (applicationRef: string, reason: string) => {
    setDecisionReasons(prev => ({
      ...prev,
      [applicationRef]: reason
    }));
  };

  const handleDecisionChange = (applicationRef: string, decision: string) => {
    setSelectedDecisions(prev => ({
      ...prev,
      [applicationRef]: decision
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
      UNDER_REVIEW: { label: "Under Review", color: "bg-blue-100 text-blue-800" },
      COMMITTEE_REVIEW: { label: "Committee Review", color: "bg-purple-100 text-purple-800" },
      APPROVED: { label: "Approved", color: "bg-green-100 text-green-800" },
      REJECTED: { label: "Declined", color: "bg-red-100 text-red-800" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { label: status, color: "bg-gray-100 text-gray-800" };

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-lg text-gray-600 mt-4">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 text-lg">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Committee Decisions 📋
        </h1>
        <p className="text-gray-600 mt-2">
          Review and make decisions on loan applications
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mt-4">
            All Caught Up! 🎉
          </h3>
          <p className="text-gray-600 mt-2">
            There are no applications pending committee review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="shadow-md">
              <CardHeader className="bg-blue-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">
                      {customer.firstName} {customer.middleName} {customer.lastName}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <span>Ref: {customer.applicationReferenceNumber}</span>
                        <span>Customer No: {customer.customerNumber}</span>
                      </div>
                    </CardDescription>
                  </div>
                  {getStatusBadge(customer.applicationStatus)}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p><strong>Loan Type:</strong> {customer.loanType}</p>
                    <p><strong>Loan Amount:</strong> ETB {customer.loanAmount.toLocaleString()}</p>
                    <p><strong>Phone:</strong> {customer.phone}</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Email:</strong> {customer.email || 'N/A'}</p>
                    <p><strong>Customer Number:</strong> {customer.customerNumber}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <h4 className="font-semibold">Decision:</h4>
                  <div className="flex flex-col space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`decision-${customer.applicationReferenceNumber}`}
                        value="APPROVED"
                        checked={selectedDecisions[customer.applicationReferenceNumber] === 'APPROVED'}
                        onChange={(e) => handleDecisionChange(customer.applicationReferenceNumber, e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-gray-700">Approve</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`decision-${customer.applicationReferenceNumber}`}
                        value="UNDER_REVIEW"
                        checked={selectedDecisions[customer.applicationReferenceNumber] === 'UNDER_REVIEW'}
                        onChange={(e) => handleDecisionChange(customer.applicationReferenceNumber, e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-gray-700">Need More Review</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`decision-${customer.applicationReferenceNumber}`}
                        value="REJECTED"
                        checked={selectedDecisions[customer.applicationReferenceNumber] === 'REJECTED'}
                        onChange={(e) => handleDecisionChange(customer.applicationReferenceNumber, e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-gray-700">Decline</span>
                    </label>
                  </div>

                  {selectedDecisions[customer.applicationReferenceNumber] === 'REJECTED' || selectedDecisions[customer.applicationReferenceNumber] ==='UNDER_REVIEW'  && (
                    <div className="space-y-2 mt-4">
                      <h4 className="font-semibold">Decision Reason (Required):</h4>
                      <textarea
                        placeholder="Enter detailed reason for declining this application..."
                        value={decisionReasons[customer.applicationReferenceNumber] || ''}
                        onChange={(e) => handleReasonChange(customer.applicationReferenceNumber, e.target.value)}
                        className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                        required
                      />
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="bg-gray-50 flex justify-between items-center p-4">
                <div className="text-sm text-gray-600">
                  Application ready for committee decision
                </div>
                <Button
                  onClick={() => handleDecision(customer.id, customer.applicationReferenceNumber)}
                  disabled={isSubmitting[customer.applicationReferenceNumber]}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting[customer.applicationReferenceNumber] ? 'Processing...' : 'Submit Decision'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <Toaster />
    </div>
  );
}