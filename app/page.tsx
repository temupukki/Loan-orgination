
"use client";

import { useEffect, useState } from "react";

interface Customer {
  id: string;
  customerNumber: string;
  tinNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  mothersName: string;
  gender: string;
  maritalStatus: string;
  dateOfBirth: string;
  nationalId: string;
  phone: string;
  email: string;
  region: string;
  zone: string;
  city: string;
  subcity: string;
  woreda: string;
  monthlyIncome: number;
  status: string;
  nationalidUrl: string;
  agreementFormUrl: string;
  accountType: string;
  createdAt: string;
  updatedAt: string;
}

export default function HomePage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const customerNumber = "CUST775744"; // the customerNumber you want to fetch

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:3000/api/loan?customerNumber=${customerNumber}`
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch");
        }
        const data: Customer = await res.json();
        setCustomer(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerNumber]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Customer Data from App A:</h1>
      {customer ? <pre>{JSON.stringify(customer, null, 2)}</pre> : <p>No customer found</p>}
    </div>
  );
}
