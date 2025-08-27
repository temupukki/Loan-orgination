// components/CreditEdit
// .tsx
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { authClient } from "@/lib/auth-client" // import the auth client
 
const { data: session, error } = await authClient.getSession()

interface CreditEditProps {
  customerId: string;
  onSuccess: () => void;
}

export function CreditEdit
({ customerId, onSuccess }: CreditEditProps) {
  const [isLoading, setIsLoading] = useState(false);

  const userId= session?.user.id;

  const handleTake = async () => {
    if (!userId) {
      toast.error("You must be logged in to take an application.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/customer/${customerId}/final`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          newStatus: "FINAL_ANALYSIS",
          creditAnalystID: userId   // <-- pass session user id here
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to take application.');
      }

      toast.success("Application successfully assigned to you and status updated to 'Under Review'.");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleTake} disabled={isLoading}>
      {isLoading ? "Updating..." : "Edit Analysis"}
    </Button>
  );
}
