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
        apiUrl = `https://temporary-cbs.vercel.app/api/loan?customerNumber=${customerNumber}`;
      } else {
        apiUrl = `https://temporary-cbs.vercel.app/api/company-loan?customerNumber=${companyNumber}`;
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
      localStorage.setItem("currentCustomer", JSON.stringify(customerData));
      window.location.href = "/dashboard/basic-info";
    } else if (searchType === "company" && companyData) {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-700 text-center">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isRelationshipManager) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4 sm:py-10 sm:px-6">
      <title>New | Loan Origination</title>
      <div className="max-w-3xl mx-auto">
        {/* Stepper Header - Mobile First Adjustments */}
        <div className="flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-10">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm sm:text-base">
                1
              </div>
              <span className="ml-2 font-semibold text-blue-700 text-sm sm:text-base">
                Search {searchType === "company" ? "Company" : "Customer"}
              </span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <div className="flex items-center opacity-40">
              <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold text-sm sm:text-base">
                2
              </div>
              <span className="ml-2 text-gray-500 text-sm sm:text-base">Basic Info</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <div className="flex items-center opacity-40">
              <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold text-sm sm:text-base">
                3
              </div>
              <span className="ml-2 text-gray-500 text-sm sm:text-base">Documents</span>
            </div>
          </div>
        </div>

        {/* Search Type Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-sm border flex flex-wrap justify-center sm:flex-nowrap">
            <button
              onClick={() => {
                setSearchType("customer");
                searchAgain();
              }}
              className={`px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all ${
                searchType === "customer"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center">
                <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Individual
              </div>
            </button>
            <button
              onClick={() => {
                setSearchType("company");
                searchAgain();
              }}
              className={`px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all ${
                searchType === "company"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center">
                <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Company
              </div>
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {!customerData && !companyData ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  Loan Origination – Step 1
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Start the process by searching for an existing {searchType === "company" ? "company" : "customer"}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {searchType === "company" ? "Company Number" : "Customer Number"}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
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
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Search {searchType === "company" ? "Company" : "Customer"}
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-4">
                  {searchType === "company" ? (
                    <Building className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  ) : (
                    <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  {searchType === "company" ? "Company" : "Customer"} Found
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Please verify the {searchType === "company" ? "company" : "customer"} details before proceeding
                </p>
              </div>

              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-base sm:text-lg mb-4 text-gray-800 flex items-center">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2" />
                  {searchType === "company" ? "Company" : "Customer"} Information
                </h3>

                {searchType === "customer" && customerData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">First Name</p>
                      <p className="font-semibold text-gray-900 text-sm sm:text-lg">{customerData.firstName || "N/A"}</p>
                    </div>

                    <div className="bg-blue-50/50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">Middle Name</p>
                      <p className="font-semibold text-gray-900 text-sm sm:text-lg">{customerData.middleName || "N/A"}</p>
                    </div>

                    <div className="bg-blue-50/50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">Last Name</p>
                      <p className="font-semibold text-gray-900 text-sm sm:text-lg">{customerData.lastName || "N/A"}</p>
                    </div>

                    <div className="bg-blue-50/50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">Customer Number</p>
                      <p className="font-semibold text-gray-900 text-sm sm:text-lg">{customerNumber}</p>
                    </div>
                  </div>
                ) : companyData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">Company Name</p>
                      <p className="font-semibold text-gray-900 text-sm sm:text-lg">{companyData.companyName || "N/A"}</p>
                    </div>

                    <div className="bg-blue-50/50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">Business Type</p>
                      <p className="font-semibold text-gray-900 text-sm sm:text-lg">{companyData.businessType || "N/A"}</p>
                    </div>

                    <div className="bg-blue-50/50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">Company Number</p>
                      <p className="font-semibold text-gray-900 text-sm sm:text-lg">{companyNumber}</p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={searchAgain}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center text-sm"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Search Again
                </button>

                <button
                  onClick={proceedToNextStep}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center text-sm"
                >
                  Proceed to Next Step
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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