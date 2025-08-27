// pages/pending-customers.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { TakeButton } from '@/components/TakeButton';
import { Skeleton } from "@/components/ui/skeleton";

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
}

export default function PendingCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPendingCustomers = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/get?status=PENDING`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch available applications');
      }
      const data = await response.json();
      setCustomers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setCustomers([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingCustomers();
  }, []);

  const formatData = (value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === "") {
      return "N/A";
    }
    if (typeof value === 'string' && value.startsWith('http')) {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          View Document
        </a>
      );
    }
    if (typeof value === 'number' && value > 1000) {
      // Format currency values
      return new Intl.NumberFormat('en-ET', {
        style: 'currency',
        currency: 'ETB'
      }).format(value);
    }
    return value;
  };

  const handleTakeSuccess = () => {
    // Refresh the page data after successfully taking an application
    fetchPendingCustomers();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-80" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="max-w-4xl mx-auto">
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <Skeleton key={item} className="h-4 w-full" />
                ))}
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-32" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-2">
          Available Applications
        </h1>
        <p className="text-gray-600 text-center">
          Review and assign applications for credit analysis
        </p>
        <Button 
          onClick={fetchPendingCustomers} 
          variant="outline" 
          className="mt-4"
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh List"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-center">
          <p className="font-medium">Error: {error}</p>
          <Button 
            onClick={fetchPendingCustomers} 
            variant="outline" 
            className="mt-2"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !error && customers.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-2xl mx-auto">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Applications Available</h2>
          <p className="text-gray-600 mb-4">
            There are no pending applications requiring review at this time.
          </p>
          <Button onClick={fetchPendingCustomers}>
            Check Again
          </Button>
        </div>
      )}

      {!isLoading && customers.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="max-w-4xl mx-auto overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-gray-900">
                      {customer.firstName} {customer.middleName} {customer.lastName}
                    </CardTitle>
                    <CardDescription className="flex flex-col md:flex-row md:gap-4 mt-2">
                      <span className="text-sm">Ref: {customer.applicationReferenceNumber}</span>
                      <span className="text-sm">Customer No: {customer.customerNumber}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 self-start md:self-auto">
                    {customer.applicationStatus}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm text-gray-600">TIN:</p>
                    <p className="text-sm font-medium">{formatData(customer.tinNumber)}</p>
                    
                    <p className="text-sm text-gray-600">National ID:</p>
                    <p className="text-sm font-medium">{formatData(customer.nationalId)}</p>
                    
                    <p className="text-sm text-gray-600">Phone:</p>
                    <p className="text-sm font-medium">{formatData(customer.phone)}</p>
                    
                    <p className="text-sm text-gray-600">Email:</p>
                    <p className="text-sm font-medium">{formatData(customer.email)}</p>
                    
                    <p className="text-sm text-gray-600">Gender:</p>
                    <p className="text-sm font-medium">{formatData(customer.gender)}</p>
                    
                    <p className="text-sm text-gray-600">Marital Status:</p>
                    <p className="text-sm font-medium">{formatData(customer.maritalStatus)}</p>
                    
                    <p className="text-sm text-gray-600">Date of Birth:</p>
                    <p className="text-sm font-medium">{formatData(new Date(customer.dateOfBirth).toLocaleDateString())}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Address & Income</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm text-gray-600">Region:</p>
                    <p className="text-sm font-medium">{formatData(customer.region)}</p>
                    
                    <p className="text-sm text-gray-600">Zone:</p>
                    <p className="text-sm font-medium">{formatData(customer.zone)}</p>
                    
                    <p className="text-sm text-gray-600">City:</p>
                    <p className="text-sm font-medium">{formatData(customer.city)}</p>
                    
                    <p className="text-sm text-gray-600">Subcity:</p>
                    <p className="text-sm font-medium">{formatData(customer.subcity)}</p>
                    
                    <p className="text-sm text-gray-600">Woreda:</p>
                    <p className="text-sm font-medium">{formatData(customer.woreda)}</p>
                    
                    <p className="text-sm text-gray-600">Monthly Income:</p>
                    <p className="text-sm font-medium">{formatData(customer.monthlyIncome)}</p>
                    
                    <p className="text-sm text-gray-600">Account Type:</p>
                    <p className="text-sm font-medium">{formatData(customer.accountType)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Business Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm text-gray-600">Major Business:</p>
                    <p className="text-sm font-medium">{formatData(customer.majorLineBusiness)}</p>
                    
                    <p className="text-sm text-gray-600">Established:</p>
                    <p className="text-sm font-medium">{formatData(new Date(customer.dateOfEstablishmentMLB).toLocaleDateString())}</p>
                    
                    <p className="text-sm text-gray-600">Economic Sector:</p>
                    <p className="text-sm font-medium">{formatData(customer.economicSector)}</p>
                    
                    <p className="text-sm text-gray-600">Customer Segment:</p>
                    <p className="text-sm font-medium">{formatData(customer.customerSegmentation)}</p>
                    
                    <p className="text-sm text-gray-600">Initiation Center:</p>
                    <p className="text-sm font-medium">{formatData(customer.creditInitiationCenter)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Loan Request</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm text-gray-600">Loan Type:</p>
                    <p className="text-sm font-medium">{formatData(customer.loanType)}</p>
                    
                    <p className="text-sm text-gray-600">Loan Amount:</p>
                    <p className="text-sm font-medium">{formatData(customer.loanAmount)}</p>
                    
                    <p className="text-sm text-gray-600">Loan Period:</p>
                    <p className="text-sm font-medium">{formatData(customer.loanPeriod)} months</p>
                    
                    <p className="text-sm text-gray-600">Repayment Mode:</p>
                    <p className="text-sm font-medium">{formatData(customer.modeOfRepayment)}</p>
                    
                    <p className="text-sm text-gray-600">Purpose:</p>
                    <p className="text-sm font-medium">{formatData(customer.purposeOfLoan)}</p>
                  </div>
                </div>
                
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Supporting Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">National ID:</span>
                      {formatData(customer.nationalidUrl)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Agreement Form:</span>
                      {formatData(customer.agreementFormUrl)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Major Business Doc:</span>
                      {formatData(customer.majorLineBusinessUrl)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Application Form:</span>
                      {formatData(customer.applicationFormUrl)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Shareholders Details:</span>
                      {formatData(customer.shareholdersDetailsUrl)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Credit Profile:</span>
                      {formatData(customer.creditProfileUrl)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Transaction Profile:</span>
                      {formatData(customer.transactionProfileUrl)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Collateral Profile:</span>
                      {formatData(customer.collateralProfileUrl)}
                    </div>
                    <div className="flex justify-between items-center md:col-span-2">
                      <span className="text-sm text-gray-600">Financial Profile:</span>
                      {formatData(customer.financialProfileUrl)}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-gray-50 border-t border-gray-200 flex justify-end py-4">
                <TakeButton 
                  customerId={customer.id} 
                  onSuccess={handleTakeSuccess}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}