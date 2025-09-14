// components/Reversed.tsx
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface ReversedProps {
  customerId: string;
  onSuccess: () => void;
}

export function Reversed({ customerId, onSuccess }: ReversedProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleTake = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/customer/${customerId}/rev`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus: "COMMITTE_REVIEW" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to take application.');
      }

     
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleTake} disabled={isLoading}>
      {isLoading ? "Updating..." : "Send to Committe"}
    </Button>
  );
}
