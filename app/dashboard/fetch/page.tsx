"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Customer } from "@/app/types/loan";
import { Loader2, Search, User, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function HomePage() {
  const [customerNumber, setCustomerNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRelationshipManager, setIsRelationshipManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkRoleStatus = async () => {
      try {
        const response = await fetch("/api/session");
        
        if (!response.ok) {
          throw new Error("Failed to fetch user session");
        }
        
        const data = await response.json();
        
        if (!data || !data.user) {
          router.push("/");
          return;
        }
        
        if (data.user.role === "RELATIONSHIP_MANAGER") {
          setIsRelationshipManager(true);
        } else {
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

  const fetchCustomer = async () => {
    if (!customerNumber.trim()) {
      setError("Please enter a customer number");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:3000/api/loan?customerNumber=${customerNumber}`
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch");
      }
      const customer: Customer = await res.json();
      
      setCustomerData(customer);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const proceedToNextStep = () => {
    if (customerData) {
      localStorage.setItem("currentCustomer", JSON.stringify(customerData));
      window.location.href = "/dashboard/basic-info";
    }
  };

  const searchAgain = () => {
    setCustomerData(null);
    setCustomerNumber("");
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

  if (!isRelationshipManager) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-200 rounded-full opacity-30 blur-xl"></div>
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-purple-200 rounded-full opacity-30 blur-xl"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-200 rounded-full opacity-40 blur-xl"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Stepper Header */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                1
              </div>
              <span className="ml-2 font-semibold text-blue-700">
                Search Customer
              </span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center opacity-40">
              <div className="h-10 w-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold">
                2
              </div>
              <span className="ml-2 text-gray-500">Basic Info</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center opacity-40">
              <div className="h-10 w-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold">
                3
              </div>
              <span className="ml-2 text-gray-500">Documents</span>
            </div>
          </div>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/50">
          {!customerData ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Loan Origination – Step 1
                </h1>
                <p className="text-gray-600">
                  Start the process by searching for an existing customer
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Number
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Enter customer number"
                    value={customerNumber}
                    onChange={(e) => setCustomerNumber(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") fetchCustomer();
                    }}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <button
                onClick={fetchCustomer}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Search Customer
                  </>
                )}
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have a customer number?{" "}
                  <a href="/new-customer" className="text-blue-600 hover:underline font-medium">
                    Create new customer
                  </a>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Customer Found
                </h1>
                <p className="text-gray-600">
                  Please verify the customer details before proceeding
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-sm mb-6">
                <h3 className="font-semibold text-lg mb-4 text-gray-800 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Customer Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium">First Name</p>
                    <p className="font-semibold text-gray-900 text-lg">{customerData.firstName || "N/A"}</p>
                  </div>
                  
                  <div className="bg-blue-50/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium">Middle Name</p>
                    <p className="font-semibold text-gray-900 text-lg">{customerData.middleName || "N/A"}</p>
                  </div>
                  
                  <div className="bg-blue-50/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium">Last Name</p>
                    <p className="font-semibold text-gray-900 text-lg">{customerData.lastName || "N/A"}</p>
                  </div>
                  
                  <div className="bg-blue-50/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium">Customer Number</p>
                    <p className="font-semibold text-gray-900 text-lg">{customerData.customerNumber}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={searchAgain}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Search Again
                </button>
                
                <button
                  onClick={proceedToNextStep}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  Proceed to Next Step
                  <svg className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}