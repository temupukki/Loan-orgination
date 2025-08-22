"use client";

import { useState, useEffect } from "react";
import { Customer } from "@/app/types/loan";
import { economicSectors, customerSegmentations, creditInitiationCenters } from "@/app/utils/constants";

export default function BasicInfoPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const customerData = localStorage.getItem('currentCustomer');
    if (customerData) {
      setCustomer(JSON.parse(customerData));
    } else {
      window.location.href = '/';
    }
  }, []);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!customer) return;
    
    const { name, value } = e.target;
    setCustomer({
      ...customer,
      [name]: value
    });
  };

  const saveAndContinue = () => {
    if (customer) {
      localStorage.setItem('currentCustomer', JSON.stringify(customer));
      window.location.href = '/business-info';
    }
  };

  const goBack = () => {
    window.location.href = '/';
  };

  if (!customer) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Basic Information</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Segmentation
              </label>
              <select
                name="customerSegmentation"
                value={customer.customerSegmentation || ""}
                onChange={handleFieldChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Segmentation</option>
                {customerSegmentations.map((segmentation) => (
                  <option key={segmentation} value={segmentation}>
                    {segmentation}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit Initiation Center
              </label>
              <select
                name="creditInitiationCenter"
                value={customer.creditInitiationCenter || ""}
                onChange={handleFieldChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Center</option>
                {creditInitiationCenters.map((center) => (
                  <option key={center} value={center}>
                    {center}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Economic Sector
              </label>
              <select
                name="economicSector"
                value={customer.economicSector || ""}
                onChange={handleFieldChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Economic Sector</option>
                {economicSectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Date
              </label>
              <input
                type="date"
                name="applicationDate"
                value={customer.applicationDate || ""}
                onChange={handleFieldChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Document Received Date
              </label>
              <input
                type="date"
                name="lastDocumentReceivedDate"
                value={customer.lastDocumentReceivedDate || ""}
                onChange={handleFieldChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
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
              Next: Business Information
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}