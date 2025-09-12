"use client";

import { useState, useEffect } from "react";
import { Customer } from "@/app/types/loan";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Upload, CheckCircle } from "lucide-react";

export default function BusinessInfoPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [lineOfBusiness, setLineOfBusiness] = useState({
    majorLineBusiness: "",
    otherLineBusiness: "",
  });
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isRelationshipManager, setIsRelationshipManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Calculate max date (one month ago from today)
  const getMaxDate = () => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    return oneMonthAgo.toISOString().split('T')[0];
  };

  // Calculate min date (reasonable past date - 100 years ago)
  const getMinDate = () => {
    const today = new Date();
    const hundredYearsAgo = new Date(today);
    hundredYearsAgo.setFullYear(today.getFullYear() - 100);
    return hundredYearsAgo.toISOString().split('T')[0];
  };

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
        } else {
          const selectedDate = new Date(customer.dateOfEstablishmentMLB);
          const maxDate = new Date(getMaxDate());
          const minDate = new Date(getMinDate());
          
          if (selectedDate > maxDate) {
            errorMessage = "Date cannot be later than one month ago";
            isValid = false;
          } else if (selectedDate < minDate) {
            errorMessage = "Please enter a valid date";
            isValid = false;
          }
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
    } else {
      const selectedDate = new Date(customer.dateOfEstablishmentMLB);
      const maxDate = new Date(getMaxDate());
      const minDate = new Date(getMinDate());
      
      if (selectedDate > maxDate) {
        newErrors.dateOfEstablishmentMLB = "Date cannot be later than one month ago";
        isValid = false;
      } else if (selectedDate < minDate) {
        newErrors.dateOfEstablishmentMLB = "Please enter a valid date";
        isValid = false;
      }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-700">Loading...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Mobile Header */}
        <div className="flex items-center mb-4 md:hidden">
          <button 
            onClick={goBack}
            className="p-2 rounded-full bg-white shadow-sm mr-2"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Business Information</h1>
        </div>

        {/* Stepper Header - Mobile Optimized */}
        <div className="flex items-center justify-center mb-6 overflow-x-auto py-2">
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
            <div className="flex items-center opacity-70 whitespace-nowrap">
              <div className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs sm:text-sm">
                1
              </div>
              <span className="ml-1 sm:ml-2 font-semibold text-blue-700 hidden xs:inline">
                Search
              </span>
            </div>
            <div className="w-6 sm:w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center opacity-70 whitespace-nowrap">
              <div className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs sm:text-sm">
                2
              </div>
              <span className="ml-1 sm:ml-2 font-semibold text-blue-700 hidden xs:inline">
                Basic Info
              </span>
            </div>
            <div className="w-6 sm:w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center whitespace-nowrap">
              <div className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs sm:text-sm">
                3
              </div>
              <span className="ml-1 sm:ml-2 font-semibold text-blue-700 hidden xs:inline">
                Business
              </span>
            </div>
            <div className="w-6 sm:w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center opacity-40 whitespace-nowrap">
              <div className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold text-xs sm:text-sm">
                4
              </div>
              <span className="ml-1 sm:ml-2 text-gray-500 hidden xs:inline">
                Loan
              </span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl p-4 sm:p-6 mb-4">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
              Loan Origination – Step 3
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Provide business information to continue
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Major Line of Business */}
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-2 border-blue-100">
              <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
                Major Line of Business *
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description *
                  </label>
                  <textarea
                    name="majorLineBusiness"
                    value={lineOfBusiness.majorLineBusiness}
                    onChange={handleLineOfBusinessChange}
                    onBlur={() => handleBlur("majorLineBusiness")}
                    className={`w-full p-2 text-sm border rounded-md ${
                      errors.majorLineBusiness && touched.majorLineBusiness
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                    rows={3}
                    placeholder="Describe your main business activity"
                  />
                  {errors.majorLineBusiness && touched.majorLineBusiness && (
                    <p className="mt-1 text-xs text-red-600">
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
                    min={getMinDate()}
                    max={getMaxDate()}
                    className={`w-full p-2 text-sm border rounded-md ${
                      errors.dateOfEstablishmentMLB &&
                      touched.dateOfEstablishmentMLB
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {errors.dateOfEstablishmentMLB &&
                    touched.dateOfEstablishmentMLB && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.dateOfEstablishmentMLB}
                      </p>
                    )}
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least one month ago (max: {getMaxDate()})
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supporting Document *
                  </label>
                  <div className="relative">
                    <label className="flex flex-col items-center justify-center w-full p-3 border-2 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-3">
                        {uploading === "majorLineBusiness" ? (
                          <>
                            <Loader2 className="w-6 h-6 mb-1 text-blue-600 animate-spin" />
                            <p className="text-xs text-gray-500">Uploading...</p>
                          </>
                        ) : customer.majorLineBusinessUrl ? (
                          <>
                            <CheckCircle className="w-6 h-6 mb-1 text-green-600" />
                            <p className="text-xs text-gray-500">Document uploaded</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 mb-1 text-gray-400" />
                            <p className="text-xs text-gray-500">
                              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-400">PDF, Word, or images (max 10MB)</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        onChange={(e) => handleDocumentUpload(e, "majorLineBusiness")}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </label>
                  </div>
                  {errors.majorLineBusinessDoc &&
                    touched.majorLineBusinessDoc && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.majorLineBusinessDoc}
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Other Line of Business */}
            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border-2 border-purple-100">
              <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
                Other Line of Business
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description
                  </label>
                  <textarea
                    name="otherLineBusiness"
                    value={lineOfBusiness.otherLineBusiness}
                    onChange={handleLineOfBusinessChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
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
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least one month ago (max: {getMaxDate()})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supporting Document
                  </label>
                  <div className="relative">
                    <label className="flex flex-col items-center justify-center w-full p-3 border-2 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-3">
                        {uploading === "otherLineBusiness" ? (
                          <>
                            <Loader2 className="w-6 h-6 mb-1 text-blue-600 animate-spin" />
                            <p className="text-xs text-gray-500">Uploading...</p>
                          </>
                        ) : customer.otherLineBusinessUrl ? (
                          <>
                            <CheckCircle className="w-6 h-6 mb-1 text-green-600" />
                            <p className="text-xs text-gray-500">Document uploaded</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 mb-1 text-gray-400" />
                            <p className="text-xs text-gray-500">
                              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-400">PDF, Word, or images (max 10MB)</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        onChange={(e) => handleDocumentUpload(e, "otherLineBusiness")}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs sm:text-sm">
            <p className="text-blue-700">
              <span className="font-medium">Note:</span> Fields marked with * are
              required. Major Line of Business information must be provided to
              continue. Establishment dates cannot be in the future and must be at least one month ago.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-between mt-6 gap-3">
            <button
              onClick={goBack}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex-1 sm:flex-initial"
            >
              Back
            </button>
            <button
              onClick={saveAndContinue}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial"
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