"use client";

import { useState, useEffect } from "react";
import { Customer } from "@/app/types/loan";
import { supabase } from "@/lib/supabase";

export default function BusinessInfoPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [lineOfBusiness, setLineOfBusiness] = useState({
    majorLineBusiness: "",
    otherLineBusiness: ""
  });
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const customerData = localStorage.getItem('currentCustomer');
    if (customerData) {
      const customerObj = JSON.parse(customerData);
      setCustomer(customerObj);
      setLineOfBusiness({
        majorLineBusiness: customerObj.majorLineBusiness || "",
        otherLineBusiness: customerObj.otherLineBusiness || ""
      });
    } else {
      window.location.href = '/';
    }
  }, []);

  const handleLineOfBusinessChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLineOfBusiness(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleCustomerFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!customer) return;
    
    const { name, value } = e.target;
    setCustomer({
      ...customer,
      [name]: value
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

    setErrors(prev => ({
      ...prev,
      [fieldName]: errorMessage
    }));

    return isValid;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate Major Line of Business (required)
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
      const bucketName = "LOAN";
      const filePath = `${type}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      throw new Error(`Failed to upload ${type} document: ${(err as Error).message}`);
    } finally {
      setUploading(null);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (!e.target.files || e.target.files.length === 0 || !customer) return;
    
    const file = e.target.files[0];
    try {
      const fileUrl = await uploadDocument(file, type);
      
      setCustomer({
        ...customer,
        [`${type}Url`]: fileUrl
      });

      // Clear document error after successful upload
      if (errors[`${type}Doc`]) {
        setErrors(prev => ({
          ...prev,
          [`${type}Doc`]: ""
        }));
      }
    } catch (err: any) {
      console.error(err.message);
      setErrors(prev => ({
        ...prev,
        [`${type}Doc`]: "Failed to upload document. Please try again."
      }));
    }
  };

  const saveAndContinue = () => {
    // Mark all required fields as touched
    setTouched({
      majorLineBusiness: true,
      dateOfEstablishmentMLB: true,
      majorLineBusinessDoc: true
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
      const updatedCustomer = {
        ...customer,
        ...lineOfBusiness
      };
      localStorage.setItem('currentCustomer', JSON.stringify(updatedCustomer));
      window.location.href = '/loan-details';
    }
  };

  const goBack = () => {
    window.location.href = '/basic-info';
  };

  if (!customer) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Business Information</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Major Line of Business - REQUIRED */}
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-100">
              <h3 className="text-lg font-medium mb-3">
                Major Line of Business *
                <span className="text-sm font-normal text-blue-600 ml-2">(Required)</span>
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
                    required
                  />
                  {errors.majorLineBusiness && touched.majorLineBusiness && (
                    <p className="mt-1 text-sm text-red-600">{errors.majorLineBusiness}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Establishment *
                  </label>
                  <input
                    type="date"
                    name="dateOfEstablishmentMLB"
                    value={customer.dateOfEstablishmentMLB || ""}
                    onChange={handleCustomerFieldChange}
                    onBlur={() => handleBlur("dateOfEstablishmentMLB")}
                    className={`w-full p-2 border rounded-md ${
                      errors.dateOfEstablishmentMLB && touched.dateOfEstablishmentMLB
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                    required
                  />
                  {errors.dateOfEstablishmentMLB && touched.dateOfEstablishmentMLB && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateOfEstablishmentMLB}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supporting Document *
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleDocumentUpload(e, 'majorLineBusiness')}
                    className={`w-full p-2 border rounded-md ${
                      errors.majorLineBusinessDoc && touched.majorLineBusinessDoc
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                  />
                  {uploading === 'majorLineBusiness' && (
                    <p className="mt-1 text-sm text-blue-600">Uploading...</p>
                  )}
                  {errors.majorLineBusinessDoc && touched.majorLineBusinessDoc && (
                    <p className="mt-1 text-sm text-red-600">{errors.majorLineBusinessDoc}</p>
                  )}
                  {customer.majorLineBusinessUrl && !errors.majorLineBusinessDoc && (
                    <p className="mt-1 text-sm text-green-600">✓ Document uploaded successfully</p>
                  )}
                </div>
              </div>
            </div>

            {/* Other Line of Business - OPTIONAL */}
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-100">
              <h3 className="text-lg font-medium mb-3">
                Other Line of Business
                <span className="text-sm font-normal text-purple-600 ml-2">(Optional)</span>
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
                    value={customer.dateOfEstablishmentOLB || ""}
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
                    onChange={(e) => handleDocumentUpload(e, 'otherLineBusiness')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {uploading === 'otherLineBusiness' && (
                    <p className="mt-1 text-sm text-blue-600">Uploading...</p>
                  )}
                  {customer.otherLineBusinessUrl && (
                    <p className="mt-1 text-sm text-green-600">✓ Document uploaded successfully</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Required fields note */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Note:</span> Fields marked with * are required. 
              Major Line of Business information must be provided to continue.
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
              Next: Loan Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}