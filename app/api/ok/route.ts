// app/api/update-application-status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Handles PATCH requests to update an application's status.
 *
 * @param req The incoming NextRequest object.
 * @returns A NextResponse object with a success message or an error.
 */
export async function PATCH(req: NextRequest) {
  try {
    // Parse the request body to get the application ID and new status
    const { applicationId, status } = await req.json();

    // Validate that the required fields are present
    if (!applicationId || !status) {
      return NextResponse.json({ error: 'Application ID and status are required' }, { status: 400 });
    }

    // Update the application status in the database using Supabase client
    const { data, error } = await supabase
      .from('Customer')
      .update({
        applicationStatus: status,
        updatedAt: new Date().toISOString(), // Automatically update the timestamp
      })
      .eq('id', applicationId) // Find the record by its ID
      .select(); // Select the updated record to return

    // If Supabase returns an error, log it and send a server error response
    if (error) {
      console.error('Error updating application status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send a success response with the updated data
    return NextResponse.json({ message: 'Application status updated successfully', data }, { status: 200 });

  } catch (error) {
    // Catch any unexpected errors during processing and send a generic server error
    console.error('Error in update-application-status API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
