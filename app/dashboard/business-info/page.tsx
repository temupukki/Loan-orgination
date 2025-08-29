"use client";

import { useState, useEffect } from "react";
import { Customer } from "@/app/types/loan";
import { supabase } from "@/lib/supabase";

export default function BusinessInfoPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [lineOfBusiness, setLineOfBusiness] = useState({
    majorLineBusiness: "",
    otherLineBusiness: "",
  });
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const customerData = localStorage.getItem("currentCustomer");
    if (customerData) {
      const customerObj = JSON.parse(customerData);
      setCustomer(customerObj);
      setLineOfBusiness({
        majorLineBusiness: customerObj.majorLineBusiness || "",
        otherLineBusiness: customerObj.otherLineBusiness || "",
      });
    } else {
      window.location.href = "/";
    }
  }, []);

  const handleLineOfBusinessChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLineOfBusiness((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCustomerFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    validateField(fieldName);
  };

  const validateField = (fieldName: string) => {
    let isValid = true;
    let errorMessage = "";

    switch (fieldName) {
      case "majorLineBusiness":
        if (!lineOfBusiness.majorLineBusiness.trim()) {
          errorMessage = "Major line of business description is required";
          isValid = false;
        }
        break;

      case "dateOfEstablishmentMLB":
        if (!customer?.dateOfEstablishmentMLB) {
          errorMessage = "Date of establishment is required";
          isValid = false;
        }
        break;

      case "majorLineBusinessDoc":
        if (!customer?.majorLineBusinessUrl) {
          errorMessage = "Supporting document is required";
          isValid = false;
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [fieldName]: errorMessage,
    }));

    return isValid;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!lineOfBusiness.majorLineBusiness.trim()) {
      newErrors.majorLineBusiness = "Major line of business description is required";
      isValid = false;
    }

    if (!customer?.dateOfEstablishmentMLB) {
      newErrors.dateOfEstablishmentMLB = "Date of establishment is required";
      isValid = false;
    }

    if (!customer?.majorLineBusinessUrl) {
      newErrors.majorLineBusinessDoc = "Supporting document is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const uploadDocument = async (file: File, type: string): Promise<string> => {
    setUploading(type);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${type}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      const { data, error } = await supabase.storage
        .from("LOAN")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("LOAN")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      throw new Error(
        `Failed to upload ${type} document: ${(err as Error).message}`
      );
    } finally {
      setUploading(null);
    }
  };

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    if (!e.target.files || e.target.files.length === 0 || !customer) return;

    const file = e.target.files[0];
    
    // Validate file
    const validTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [`${type}Doc`]: "Please upload PDF, Word, or image files only"
      }));
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [`${type}Doc`]: "File size must be less than 10MB"
      }));
      return;
    }

    try {
      const fileUrl = await uploadDocument(file, type);

      setCustomer({
        ...customer,
        [`${type}Url`]: fileUrl,
      });

      if (errors[`${type}Doc`]) {
        setErrors((prev) => ({
          ...prev,
          [`${type}Doc`]: "",
        }));
      }
    } catch (err: any) {
      console.error(err.message);
      setErrors((prev) => ({
        ...prev,
        [`${type}Doc`]: "Failed to upload document. Please try again.",
      }));
    }
  };

  const saveAndContinue = () => {
    setTouched({
      majorLineBusiness: true,
      dateOfEstablishmentMLB: true,
      majorLineBusinessDoc: true,
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
      const updatedCustomer = {
        ...customer,
        ...lineOfBusiness,
      };
      localStorage.setItem("currentCustomer", JSON.stringify(updatedCustomer));
      window.location.href = "/dashboard/loan-details";
    }
  };

  const goBack = () => {
    window.location.href = "/dashboard/basic-info";
  };

  if (!customer)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <div className="flex items-center opacity-70">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                2
              </div>
              <span className="ml-2 font-semibold text-blue-700">
                Basic Info
              </span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                3
              </div>
              <span className="ml-2 font-semibold text-blue-700">
                Business Info
              </span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center opacity-40">
              <div className="h-10 w-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold">
                4
              </div>
              <span className="ml-2 text-gray-500">Loan Details</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Loan Origination – Step 3
            </h1>
            <p className="text-gray-600">
              Provide business information to continue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Major Line of Business */}
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-100">
              <h3 className="text-lg font-medium mb-3">
                Major Line of Business *
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description *
                  </label>
                  <textarea
                    name="majorLineBusiness"
                    value={lineOfBusiness.majorLineBusiness}
                    onChange={handleLineOfBusinessChange}
                    onBlur={() => handleBlur("majorLineBusiness")}
                    className={`w-full p-2 border rounded-md ${
                      errors.majorLineBusiness && touched.majorLineBusiness
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                    rows={3}
                    placeholder="Describe your main business activity"
                  />
                  {errors.majorLineBusiness && touched.majorLineBusiness && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.majorLineBusiness}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Establishment *
                  </label>
                  <input
                    type="date"
                    name="dateOfEstablishmentMLB"
                    value={customer.dateOfEstablishmentMLB ? new Date(customer.dateOfEstablishmentMLB).toISOString().split('T')[0] : ""}
                    onChange={handleCustomerFieldChange}
                    onBlur={() => handleBlur("dateOfEstablishmentMLB")}
                    className={`w-full p-2 border rounded-md ${
                      errors.dateOfEstablishmentMLB &&
                      touched.dateOfEstablishmentMLB
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {errors.dateOfEstablishmentMLB &&
                    touched.dateOfEstablishmentMLB && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.dateOfEstablishmentMLB}
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supporting Document *
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleDocumentUpload(e, "majorLineBusiness")}
                    className={`w-full p-2 border rounded-md ${
                      errors.majorLineBusinessDoc && touched.majorLineBusinessDoc
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {uploading === "majorLineBusiness" && (
                    <p className="mt-1 text-sm text-blue-600">Uploading...</p>
                  )}
                  {errors.majorLineBusinessDoc &&
                    touched.majorLineBusinessDoc && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.majorLineBusinessDoc}
                      </p>
                    )}
                  {customer.majorLineBusinessUrl &&
                    !errors.majorLineBusinessDoc && (
                      <p className="mt-1 text-sm text-green-600">
                        ✓ Document uploaded successfully
                      </p>
                    )}
                  <p className="mt-1 text-xs text-gray-500">
                    Upload PDF, Word, or image files (max 10MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Other Line of Business */}
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-100">
              <h3 className="text-lg font-medium mb-3">
                Other Line of Business
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description
                  </label>
                  <textarea
                    name="otherLineBusiness"
                    value={lineOfBusiness.otherLineBusiness}
                    onChange={handleLineOfBusinessChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe any additional business activities (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Establishment
                  </label>
                  <input
                    type="date"
                    name="dateOfEstablishmentOLB"
                    value={customer.dateOfEstablishmentOLB ? new Date(customer.dateOfEstablishmentOLB).toISOString().split('T')[0] : ""}
                    onChange={handleCustomerFieldChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supporting Document
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleDocumentUpload(e, "otherLineBusiness")}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {uploading === "otherLineBusiness" && (
                    <p className="mt-1 text-sm text-blue-600">Uploading...</p>
                  )}
                  {customer.otherLineBusinessUrl && (
                    <p className="mt-1 text-sm text-green-600">
                      ✓ Document uploaded successfully
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Upload PDF, Word, or image files (max 10MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Note:</span> Fields marked with * are
              required. Major Line of Business information must be provided to
              continue.
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
              Next: Loan Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}