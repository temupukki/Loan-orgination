"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Customer, CompanyCustomer } from "@/app/types/loan";
import { Loader2, Building, User, Search, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function HomePage() {
  const [customerNumber, setCustomerNumber] = useState("");
  const [companyNumber, setCompanyNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRelationshipManager, setIsRelationshipManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchType, setSearchType] = useState<"customer" | "company">("customer");
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [companyData, setCompanyData] = useState<CompanyCustomer | null>(null);
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

  const fetchEntity = async () => {
    if (searchType === "customer" && !customerNumber.trim()) {
      setError("Please enter a customer number");
      return;
    }
    
    if (searchType === "company" && !companyNumber.trim()) {
      setError("Please enter a company number");
      return;
    }

    setLoading(true);
    setError("");
    try {
      let apiUrl = "";
      
      if (searchType === "customer") {
        apiUrl = `http://localhost:3000/api/loan?customerNumber=${customerNumber}`;
      } else {
        apiUrl = `http://localhost:3000/api/company-loan?customerNumber=${companyNumber}`;
      }
      
      const res = await fetch(apiUrl);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch");
      }
      
      if (searchType === "customer") {
        const customer: Customer = await res.json();
        setCustomerData(customer);
        setCompanyData(null);
      } else {
        const company: CompanyCustomer = await res.json();
        setCompanyData(company);
        setCustomerData(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const proceedToNextStep = () => {
    if (searchType === "customer" && customerData) {
      // Store customer data and navigate to appropriate page
      localStorage.setItem("currentCustomer", JSON.stringify(customerData));
      window.location.href = "/dashboard/basic-info";
    } else if (searchType === "company" && companyData) {
      // Store company data and navigate to appropriate page
      localStorage.setItem("currentCompany", JSON.stringify(companyData));
      window.location.href = "/dashboard/basic-info";
    }
  };

  const searchAgain = () => {
    setCustomerData(null);
    setCompanyData(null);
    setCustomerNumber("");
    setCompanyNumber("");
  };

  // Show loading state while checking authentication
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Stepper Header */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                1
              </div>
              <span className="ml-2 font-semibold text-blue-700">
                Search {searchType === "company" ? "Company" : "Customer"}
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

        {/* Search Type Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => {
                setSearchType("customer");
                searchAgain();
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                searchType === "customer"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Individual
              </div>
            </button>
            <button
              onClick={() => {
                setSearchType("company");
                searchAgain();
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                searchType === "company"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Company
              </div>
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!customerData && !companyData ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Loan Origination – Step 1
                </h1>
                <p className="text-gray-600">
                  Start the process by searching for an existing {searchType === "company" ? "company" : "customer"}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {searchType === "company" ? "Company Number" : "Customer Number"}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder={searchType === "company" ? "Enter company number" : "Enter customer number"}
                    value={searchType === "company" ? companyNumber : customerNumber}
                    onChange={(e) => 
                      searchType === "company" 
                        ? setCompanyNumber(e.target.value) 
                        : setCustomerNumber(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") fetchEntity();
                    }}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <button
                onClick={fetchEntity}
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
                    Search {searchType === "company" ? "Company" : "Customer"}
                  </>
                )}
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have a {searchType === "company" ? "company" : "customer"} number?{" "}
                  <a 
                    href={searchType === "company" ? "/new-company" : "/new-customer"} 
                    className="text-blue-600 hover:underline"
                  >
                    Create new {searchType === "company" ? "company" : "customer"}
                  </a>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  {searchType === "company" ? (
                    <Building className="h-8 w-8 text-blue-600" />
                  ) : (
                    <User className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {searchType === "company" ? "Company" : "Customer"} Found
                </h1>
                <p className="text-gray-600">
                  Please verify the {searchType === "company" ? "company" : "customer"} details before proceeding
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-lg mb-4 text-gray-800 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  {searchType === "company" ? "Company" : "Customer"} Information
                </h3>
                
                {searchType === "customer" && customerData ? (
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
                      <p className="font-semibold text-gray-900 text-lg">{customerNumber}</p>
                    </div>
                  </div>
                ) : companyData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">Company Name</p>
                      <p className="font-semibold text-gray-900 text-lg">{companyData.companyName || "N/A"}</p>
                    </div>
                    
                    <div className="bg-blue-50/50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">Business Type</p>
                      <p className="font-semibold text-gray-900 text-lg">{companyData.businessType || "N/A"}</p>
                    </div>
                    
                    <div className="bg-blue-50/50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">Company Number</p>
                      <p className="font-semibold text-gray-900 text-lg">{companyNumber}</p>
                    </div>
                  </div>
                ) : null}
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