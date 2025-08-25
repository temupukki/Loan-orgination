"use client";

import { useState } from "react";
import { Customer } from "@/app/types/loan";

export default function HomePage() {
  const [customerNumber, setCustomerNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCustomer = async () => {
    if (!customerNumber.trim()) {
      setError("Please enter a customer number");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:3000/api/loan?customerNumber=${customerNumber}`
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch");
      }
      const customer: Customer = await res.json();

      // Store customer data and navigate to basic info
      localStorage.setItem("currentCustomer", JSON.stringify(customer));
      window.location.href = "/dashboard/basic-info";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
                Search Customer
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

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Loan Origination – Step 1
            </h1>
            <p className="text-gray-600">
              Start the process by searching for an existing customer
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Number
            </label>
            <input
              type="text"
              placeholder="Enter customer number"
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchCustomer();
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <button
            onClick={fetchCustomer}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search Customer"}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don’t have a customer number?{" "}
              <a href="/new-customer" className="text-blue-600 hover:underline">
                Create new customer
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
