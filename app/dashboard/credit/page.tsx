// pages/pending-customers.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // You'll need to add this component
import { Separator } from "@/components/ui/separator"; // And this one too
import { TakeButton } from '@/components/TakeButton';

// A more comprehensive interface based on your full Prisma schema
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

  useEffect(() => {
    const fetchPendingCustomers = async () => {
      try {
        const response = await fetch(`/api/get?status=PENDING`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch pending customers');
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

  const formatData = (value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === "") {
      return "N/A";
    }
    if (typeof value === 'string' && value.startsWith('http')) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          View Document
        </a>
      );
    }
    return value;
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
        Pending Applications ⏳
      </h1>

      {isLoading && <div className="text-center text-lg text-gray-600">Fetching pending applications...</div>}
      {error && <div className="text-center text-red-600 text-lg p-4 bg-red-100 rounded-lg">Error: {error}</div>}

      {!isLoading && !error && customers.length === 0 && (
        <div className="text-center text-lg text-gray-500 p-4 bg-white rounded-lg shadow-md">
          <p>There are no pending applications at the moment. 🎉</p>
        </div>
      )}

      {!isLoading && customers.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{customer.firstName} {customer.middleName} {customer.lastName}</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {customer.applicationStatus}
                  </Badge>
                </CardTitle>
                <CardDescription className="flex justify-between items-center text-sm">
                  <span>Ref: {customer.applicationReferenceNumber}</span>
                  <span>Customer No: {customer.customerNumber}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-700">Personal & Contact Information</h3>
                  <Separator />
                  <p><strong>TIN:</strong> {formatData(customer.tinNumber)}</p>
                  <p><strong>National ID:</strong> {formatData(customer.nationalId)}</p>
                  <p><strong>Phone:</strong> {formatData(customer.phone)}</p>
                  <p><strong>Email:</strong> {formatData(customer.email)}</p>
                  <p><strong>Gender:</strong> {formatData(customer.gender)}</p>
                  <p><strong>Marital Status:</strong> {formatData(customer.maritalStatus)}</p>
                  <p><strong>Date of Birth:</strong> {formatData(new Date(customer.dateOfBirth).toLocaleDateString())}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-700">Address</h3>
                  <Separator />
                  <p><strong>Region:</strong> {formatData(customer.region)}</p>
                  <p><strong>Zone:</strong> {formatData(customer.zone)}</p>
                  <p><strong>City:</strong> {formatData(customer.city)}</p>
                  <p><strong>Subcity:</strong> {formatData(customer.subcity)}</p>
                  <p><strong>Woreda:</strong> {formatData(customer.woreda)}</p>
                  <p><strong>Monthly Income:</strong> {formatData(customer.monthlyIncome)}</p>
                  <p><strong>Account Type:</strong> {formatData(customer.accountType)}</p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-700">Business & Financials</h3>
                  <Separator />
                  <p><strong>Major Line of Business:</strong> {formatData(customer.majorLineBusiness)}</p>
                  <p><strong>Date of Establishment (MLB):</strong> {formatData(new Date(customer.dateOfEstablishmentMLB).toLocaleDateString())}</p>
                  <p><strong>Economic Sector:</strong> {formatData(customer.economicSector)}</p>
                  <p><strong>Customer Segmentation:</strong> {formatData(customer.customerSegmentation)}</p>
                  <p><strong>Credit Initiation Center:</strong> {formatData(customer.creditInitiationCenter)}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-700">Loan Details</h3>
                  <Separator />
                  <p><strong>Loan Type:</strong> {formatData(customer.loanType)}</p>
                  <p><strong>Loan Amount:</strong> {formatData(customer.loanAmount)}</p>
                  <p><strong>Loan Period:</strong> {formatData(customer.loanPeriod)} months</p>
                  <p><strong>Mode of Repayment:</strong> {formatData(customer.modeOfRepayment)}</p>
                  <p><strong>Purpose of Loan:</strong> {formatData(customer.purposeOfLoan)}</p>
                </div>
                
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-semibold text-lg text-gray-700">Documents</h3>
                  <Separator />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <p><strong>National ID:</strong> {formatData(customer.nationalidUrl)}</p>
                    <p><strong>Agreement Form:</strong> {formatData(customer.agreementFormUrl)}</p>
                    <p><strong>Major Business Doc:</strong> {formatData(customer.majorLineBusinessUrl)}</p>
                    <p><strong>Application Form:</strong> {formatData(customer.applicationFormUrl)}</p>
                    <p><strong>Shareholders Details:</strong> {formatData(customer.shareholdersDetailsUrl)}</p>
                    <p><strong>Credit Profile:</strong> {formatData(customer.creditProfileUrl)}</p>
                    <p><strong>Transaction Profile:</strong> {formatData(customer.transactionProfileUrl)}</p>
                    <p><strong>Collateral Profile:</strong> {formatData(customer.collateralProfileUrl)}</p>
                    <p><strong>Financial Profile:</strong> {formatData(customer.financialProfileUrl)}</p>
                  </div>
                </div>

              </CardContent>
            <CardFooter>
  <TakeButton 
    customerId={customer.id} 
    onSuccess={() => {
      // Optional: refresh the page, refetch customer, or show a toast
      console.log("Customer assigned successfully");
    }} 
  />
</CardFooter>

            </Card>
          ))}
        </div>
      )}
    </div>
  );
}