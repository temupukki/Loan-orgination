"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Customer } from "@/app/types/loan";
import {
  economicSectors,
  customerSegmentations,
  creditInitiationCenters,
} from "@/app/utils/constants";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function BasicInfoPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
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
          if (customerData) {
            setCustomer(JSON.parse(customerData));
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

  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
    validateField(fieldName, customer?.[fieldName as keyof Customer] as string);
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
      router.push("/dashboard/business-info");
    }
  };

  const goBack = () => {
    router.push("/dashboard");
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

  if (!customer)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-700 text-center">Loading customer data...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4 sm:py-10 sm:px-6">
      <title>Basic Info | Loan Origination</title>
      <div className="max-w-4xl mx-auto">
        {/* Stepper Header - Mobile-friendly */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10">
          <div className="flex items-center opacity-70">
            <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm sm:text-base">
              1
            </div>
            <span className="ml-2 font-semibold text-blue-700 text-sm sm:text-base">
              Search Customer
            </span>
          </div>
          <div className="hidden sm:block w-8 md:w-12 h-0.5 bg-gray-300"></div>
          <div className="flex items-center">
            <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm sm:text-base">
              2
            </div>
            <span className="ml-2 font-semibold text-blue-700 text-sm sm:text-base">
              Basic Info
            </span>
          </div>
          <div className="hidden sm:block w-8 md:w-12 h-0.5 bg-gray-300"></div>
          <div className="flex items-center opacity-40">
            <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold text-sm sm:text-base">
              3
            </div>
            <span className="ml-2 text-gray-500 text-sm sm:text-base">Business Info</span>
          </div>
          <div className="hidden sm:block w-8 md:w-12 h-0.5 bg-gray-300"></div>
          <div className="flex items-center opacity-40">
            <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold text-sm sm:text-base">
              4
            </div>
            <span className="ml-2 text-gray-500 text-sm sm:text-base">Documents</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Loan Origination – Step 2
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Provide the customer&apos;s basic information to continue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                className={`w-full p-3 border rounded-lg text-sm sm:text-base ${
                  errors.customerSegmentation && touched.customerSegmentation
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
                required
              >
                <option value="">Select Segmentation</option>
                {customerSegmentations.map((segmentation) => (
                  <option key={segmentation} value={segmentation}>
                    {segmentation}
                  </option>
                ))}
              </select>
              {errors.customerSegmentation &&
                touched.customerSegmentation && (
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
                className={`w-full p-3 border rounded-lg text-sm sm:text-base ${
                  errors.creditInitiationCenter &&
                  touched.creditInitiationCenter
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
              {errors.creditInitiationCenter &&
                touched.creditInitiationCenter && (
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
                className={`w-full p-3 border rounded-lg text-sm sm:text-base ${
                  errors.economicSector && touched.economicSector
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
                required
              >
                <option value="">Select Economic Sector</option>
                {economicSectors.map((sector) => (
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
          </div>

          {/* Required fields note */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Note:</span> Fields marked with * are
              required.
            </p>
          </div>

          {/* Actions - Mobile-friendly layout */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={goBack}
              className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            <button
              onClick={saveAndContinue}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              disabled={
                Object.values(errors).some((error) => error) &&
                Object.keys(touched).length > 0
              }
            >
              Next: Business Information
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}