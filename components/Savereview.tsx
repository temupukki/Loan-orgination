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
  newStatus?: string;
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

  // ✅ Internal validation function
  const validateSupervisorData = (refNumber: string) => {
    const errors: string[] = [];
    const review = reviewData?.[refNumber];

    // Check all required fields with correct field names
    if (!review?.pestelAnalysisScore) {
      errors.push("PESTEL Analysis score is required");
    }
    if (!review?.swotAnalysisScore) {
      errors.push("SWOT Analysis score is required");
    }
    if (!review?.riskAssessmentScore) {
      errors.push("Risk Assessment score is required");
    }
    if (!review?.esgAssessmentScore) {
      errors.push("ESG Assessment score is required");
    }
    if (!review?.financialNeedScore) {
      errors.push("Financial Need score is required");
    }
    if (!review?.reviewNotes || review.reviewNotes.trim() === "") {
      errors.push("Review Notes are required");
    }

    return errors;
  };

  const handleSaveReview = async () => {
    if (!refNumber) {
      toast.error("Missing reference number.");
      return;
    }

    if (!reviewData || !reviewData[refNumber]) {
      toast.error("No review data found for this reference number.");
      return;
    }

    // ✅ Run validation
    const errors = validateSupervisorData(refNumber);
    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return;
    }

    const analysisPayload = reviewData[refNumber];
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

      // 2️⃣ Update status (default SUPERVISED if newStatus not passed)
      const statusResponse = await fetch(`/api/customer/${customerId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus: newStatus || "SUPERVISED" }),
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