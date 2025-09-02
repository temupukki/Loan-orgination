'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface SaveButtonProps {
  customerId: string;
  refNumber?: string;
  analysisData?: Record<string, any>;
  validateAnalysisData?: (refNumber: string) => string[]; // ✅ new
  onSuccess: () => void;
  actionType: 'saveAnalysis' | 'takeApplication';
  buttonText?: string;
}

export function SaveButton({
  customerId,
  refNumber,
  analysisData,
  validateAnalysisData, // ✅
  onSuccess,
  actionType,
  buttonText
}: SaveButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Save analysis + update status
  const handleSaveAnalysis = async () => {
    if (!refNumber || !analysisData) return;

    // ✅ Run validation before saving
    if (validateAnalysisData) {
      const errors = validateAnalysisData(refNumber);
      if (errors.length > 0) {
        toast.error("Please fix the following before saving:\n" + errors.join("\n"));
        return;
      }
    }

    const analysisPayload = analysisData[refNumber];
    if (!analysisPayload) {
      toast.error("No analysis data found for this reference number.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Save the analysis data
      const response = await fetch('/api/save-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationReferenceNumber: refNumber,
          ...analysisPayload,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save analysis data.');
      }

      // 2. Update application status after saving analysis
      const statusResponse = await fetch(`/api/customer/${customerId}/save`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus: "ANALYSIS_COMPLETED" }),
      });

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        throw new Error(errorData.error || 'Failed to update application status.');
      }

      toast.success("Analysis saved and application status updated!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Take application only
  const handleTakeApplication = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/customer/${customerId}/save`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus: "ANALYSIS_COMPLETED" }),
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

  const handleClick = () => {
    if (actionType === 'saveAnalysis') {
      handleSaveAnalysis();
    } else {
      handleTakeApplication();
    }
  };

  const getButtonText = () => {
    if (buttonText) return buttonText;
    return actionType === 'saveAnalysis'
      ? (isLoading ? "Saving..." : "Save Analysis")
      : (isLoading ? "Updating..." : "Take Application");
  };

  return (
    <Button onClick={handleClick} disabled={isLoading}>
      {getButtonText()}
    </Button>
  );
}
