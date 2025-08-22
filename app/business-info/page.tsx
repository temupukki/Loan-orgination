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
  };

  const handleCustomerFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!customer) return;
    
    const { name, value } = e.target;
    setCustomer({
      ...customer,
      [name]: value
    });
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
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const saveAndContinue = () => {
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
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Major Line of Business</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description
                  </label>
                  <textarea
                    name="majorLineBusiness"
                    value={lineOfBusiness.majorLineBusiness}
                    onChange={handleLineOfBusinessChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Establishment
                  </label>
                  <input
                    type="date"
                    name="dateOfEstablishmentMLB"
                    value={customer.dateOfEstablishmentMLB || ""}
                    onChange={handleCustomerFieldChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supporting Document
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleDocumentUpload(e, 'majorLineBusiness')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {uploading === 'majorLineBusiness' && <span>Uploading...</span>}
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Other Line of Business</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description
                  </label>
                  <textarea
                    name="otherLineBusiness"
                    value={lineOfBusiness.otherLineBusiness}
                    onChange={handleLineOfBusinessChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
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
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supporting Document
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleDocumentUpload(e, 'otherLineBusiness')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {uploading === 'otherLineBusiness' && <span>Uploading...</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={goBack}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={saveAndContinue}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
            >
              Next: Loan Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}