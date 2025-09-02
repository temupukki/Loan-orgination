"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Customer, CompanyCustomer } from "@/app/types/loan";
import {
  economicSectors,
  customerSegmentations,
  creditInitiationCenters,
  companyEconomicSectors,
  companyCustomerSegmentations,
} from "@/app/utils/constants";
import { Loader2, Building, User } from "lucide-react";
import { toast } from "sonner";

export default function BasicInfoPage() {
  const [customer, setCustomer] = useState<Customer | CompanyCustomer | null>(null);
  const [customerType, setCustomerType] = useState<"personal" | "company">("personal");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isRelationshipManager, setIsRelationshipManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
          
          const customerData = localStorage.getItem("currentCustomer");
          const customerTypeData = localStorage.getItem("customerType");
          
          if (customerData) {
            setCustomer(JSON.parse(customerData));
          }
          if (customerTypeData) {
            setCustomerType(customerTypeData as "personal" | "company");
          } else {
            router.push("/dashboard");
          }
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

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!customer) return;

    const { name, value } = e.target;
    setCustomer({
      ...customer,
      [name]: value,
    });

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCustomerTypeChange = (type: "personal" | "company") => {
    setCustomerType(type);
    localStorage.setItem("customerType", type);
    
    // Reset customer data when switching types
    setCustomer(null);
    setErrors({});
    setTouched({});
  };

  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
    validateField(fieldName, customer?.[fieldName as keyof (Customer | CompanyCustomer)] as string);
  };

  const validateField = (fieldName: string, value: string | undefined) => {
    if (!value || value.trim() === "") {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "This field is required",
      }));
      return false;
    }
    setErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
    return true;
  };

  const validateForm = () => {
    if (!customer) return false;

    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Common validations for both customer types
    if (!customer.customerSegmentation?.trim()) {
      newErrors.customerSegmentation = "Customer segmentation is required";
      isValid = false;
    }

    if (!customer.creditInitiationCenter?.trim()) {
      newErrors.creditInitiationCenter = "Credit initiation center is required";
      isValid = false;
    }

    if (!customer.economicSector?.trim()) {
      newErrors.economicSector = "Economic sector is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const saveAndContinue = () => {
    setTouched({
      customerSegmentation: true,
      creditInitiationCenter: true,
      economicSector: true,
    });

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (customer) {
      localStorage.setItem("currentCustomer", JSON.stringify(customer));
      localStorage.setItem("customerType", customerType);
      router.push("/dashboard/business-info");
    }
  };

  const goBack = () => {
    router.push("/dashboard");
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

  if (!customer)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-700">Loading customer data...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Stepper Header */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center space-x-4">
            <div className="flex items-center opacity-70">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                1
              </div>
              <span className="ml-2 font-semibold text-blue-700">
                Search Customer
              </span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                2
              </div>
              <span className="ml-2 font-semibold text-blue-700">
                Basic Info
              </span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center opacity-40">
              <div className="h-10 w-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold">
                3
              </div>
              <span className="ml-2 text-gray-500">Business Info</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center opacity-40">
              <div className="h-10 w-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold">
                4
              </div>
              <span className="ml-2 text-gray-500">Documents</span>
            </div>
          </div>
        </div>

        {/* Customer Type Toggle */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Customer Type
            </h2>
            <p className="text-gray-600">Select the type of customer</p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleCustomerTypeChange("personal")}
              className={`flex items-center px-6 py-3 rounded-lg border-2 transition-all ${
                customerType === "personal"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-600 hover:border-blue-400"
              }`}
            >
              <User className="h-5 w-5 mr-2" />
              Personal Customer
            </button>
            
            <button
              onClick={() => handleCustomerTypeChange("company")}
              className={`flex items-center px-6 py-3 rounded-lg border-2 transition-all ${
                customerType === "company"
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-gray-300 bg-white text-gray-600 hover:border-green-400"
              }`}
            >
              <Building className="h-5 w-5 mr-2" />
              Company Customer
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Loan Origination – Step 2
            </h1>
            <p className="text-gray-600">
              Provide the {customerType === "personal" ? "customer's" : "company's"} basic information to continue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Segmentation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Segmentation *
              </label>
              <select
                name="customerSegmentation"
                value={customer.customerSegmentation || ""}
                onChange={handleFieldChange}
                onBlur={() => handleBlur("customerSegmentation")}
                className={`w-full p-3 border rounded-lg ${
                  errors.customerSegmentation && touched.customerSegmentation
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
                required
              >
                <option value="">Select Segmentation</option>
                {(customerType === "personal" ? customerSegmentations : companyCustomerSegmentations).map((segmentation) => (
                  <option key={segmentation} value={segmentation}>
                    {segmentation}
                  </option>
                ))}
              </select>
              {errors.customerSegmentation && touched.customerSegmentation && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.customerSegmentation}
                </p>
              )}
            </div>

            {/* Credit Initiation Center */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit Initiation Center *
              </label>
              <select
                name="creditInitiationCenter"
                value={customer.creditInitiationCenter || ""}
                onChange={handleFieldChange}
                onBlur={() => handleBlur("creditInitiationCenter")}
                className={`w-full p-3 border rounded-lg ${
                  errors.creditInitiationCenter && touched.creditInitiationCenter
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
                required
              >
                <option value="">Select Center</option>
                {creditInitiationCenters.map((center) => (
                  <option key={center} value={center}>
                    {center}
                  </option>
                ))}
              </select>
              {errors.creditInitiationCenter && touched.creditInitiationCenter && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.creditInitiationCenter}
                </p>
              )}
            </div>

            {/* Economic Sector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Economic Sector *
              </label>
              <select
                name="economicSector"
                value={customer.economicSector || ""}
                onChange={handleFieldChange}
                onBlur={() => handleBlur("economicSector")}
                className={`w-full p-3 border rounded-lg ${
                  errors.economicSector && touched.economicSector
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
                required
              >
                <option value="">Select Economic Sector</option>
                {(customerType === "personal" ? economicSectors : companyEconomicSectors).map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
              {errors.economicSector && touched.economicSector && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.economicSector}
                </p>
              )}
            </div>

            {/* Additional Company-specific fields */}
            {customerType === "company" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <select
                    name="businessType"
                    value={(customer as CompanyCustomer).businessType || ""}
                    onChange={handleFieldChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Business Type</option>
                    <option value="sole-proprietorship">Sole Proprietorship</option>
                    <option value="partnership">Partnership</option>
                    <option value="corporation">Corporation</option>
                    <option value="llc">Limited Liability Company</option>
                    <option value="non-profit">Non-Profit Organization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Employees
                  </label>
                  <input
                    type="number"
                    name="numberOfEmployees"
                    value={(customer as CompanyCustomer).numberOfEmployees || ""}
                    onChange={handleFieldChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter number of employees"
                  />
                </div>
              </>
            )}
          </div>

          {/* Required fields note */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Note:</span> Fields marked with * are
              required.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-8">
            <button
              onClick={goBack}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={saveAndContinue}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                Object.values(errors).some((error) => error) &&
                Object.keys(touched).length > 0
              }
            >
              Next: Business Information
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}