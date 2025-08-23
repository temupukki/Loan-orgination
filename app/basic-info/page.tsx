"use client";

import { useState, useEffect } from "react";
import { Customer } from "@/app/types/loan";
import {
  economicSectors,
  customerSegmentations,
  creditInitiationCenters,
} from "@/app/utils/constants";

export default function BasicInfoPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const customerData = localStorage.getItem("currentCustomer");
    if (customerData) {
      setCustomer(JSON.parse(customerData));
    } else {
      window.location.href = "/";
    }
  }, []);

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!customer) return;

    const { name, value } = e.target;
    setCustomer({
      ...customer,
      [name]: value,
    });

    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
    
    // Validate the field when it loses focus
    validateField(fieldName, customer?.[fieldName as keyof Customer] as string);
  };

  const validateField = (fieldName: string, value: string | undefined) => {
    if (!value || value.trim() === "") {
      setErrors(prev => ({
        ...prev,
        [fieldName]: "This field is required"
      }));
      return false;
    }
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: ""
    }));
    return true;
  };

  const validateForm = () => {
    if (!customer) return false;

    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate all required fields
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
    // Mark all fields as touched to show errors
    setTouched({
      customerSegmentation: true,
      creditInitiationCenter: true,
      economicSector: true
    });

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (customer) {
      localStorage.setItem("currentCustomer", JSON.stringify(customer));
      window.location.href = "/business-info";
    }
  };

  const goBack = () => {
    window.location.href = "/";
  };

  if (!customer)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Basic Information
          </h1>

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
                className={`w-full p-2 border rounded-md ${
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
              {errors.customerSegmentation && touched.customerSegmentation && (
                <p className="mt-1 text-sm text-red-600">{errors.customerSegmentation}</p>
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
                className={`w-full p-2 border rounded-md ${
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
                <p className="mt-1 text-sm text-red-600">{errors.creditInitiationCenter}</p>
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
                className={`w-full p-2 border rounded-md ${
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
                <p className="mt-1 text-sm text-red-600">{errors.economicSector}</p>
              )}
            </div>
          </div>

          {/* Required fields note */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Note:</span> Fields marked with * are required.
            </p>
          </div>

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
              disabled={Object.values(errors).some(error => error) && Object.keys(touched).length > 0}
            >
              Next: Business Information
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}