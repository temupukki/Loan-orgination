'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface SaveReviewButtonProps {
  customerId: string;
  refNumber?: string;
  reviewData?: Record<string, any>;
  onSuccess: () => void;
  buttonText?: string;
  newStatus?: string; // Optional status to update after save
}

export function SaveReviewButton({
  customerId,
  refNumber,
  reviewData,
  onSuccess,
  buttonText,
  newStatus
}: SaveReviewButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveReview = async () => {
    if (!refNumber || !reviewData) {
      toast.error("Missing reference number or review data.");
      return;
    }

    const analysisPayload = reviewData[refNumber];
    if (!analysisPayload) {
      toast.error("No analysis data found for this reference number.");
      return;
    }

    setIsLoading(true);

    try {
      // 1️⃣ Save the review/analysis data
      const saveResponse = await fetch('/api/save-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationReferenceNumber: refNumber,
          ...analysisPayload,
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save review data.');
      }

      // 2️⃣ Update the application status if newStatus is provided
     
        const statusResponse = await fetch(`/api/customer/${customerId}/review`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newStatus: "SUPERVISED" }),
        });

        if (!statusResponse.ok) {
          const errorData = await statusResponse.json();
          throw new Error(errorData.error || 'Failed to update application status.');
        }
      

      toast.success("Review saved and status updated!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSaveReview} disabled={isLoading}>
      {isLoading ? "Saving..." : buttonText || "Save Review"}
    </Button>
  );
}
