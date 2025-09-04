import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { Userrole } from "@prisma/client"; // Import the Prisma UserRole enum

// Define a schema for the incoming request body
const requestSchema = z.object({
  email: z.string().email(),
  role: z.enum([
    "ADMIN",
    "RELATIONSHIP_MANAGER",
    "CREDIT_ANALYST",
    "SUPERVISOR",
    "COMMITTE_MEMBER",
    "APPROVAL_COMMITTE"
  ]),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize the user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check if the user is an ADMIN
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: You must be an ADMIN to perform this action" },
        { status: 403 }
      );
    }
    
    // Parse and validate the request body
    const body = await request.json();
    const { email, role } = requestSchema.parse(body);

    // Find the user by their email and update the role
    const updatedUser = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        // Fix: Cast the string 'role' to the Prisma enum type 'UserRole'
        role: role as Userrole,
      },
    });

    // Return a success response
    return NextResponse.json(
      { message: `User role for ${updatedUser.email} updated successfully to ${updatedUser.role}` },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error updating user role:", err);

    // Handle Zod validation errors
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data. Please check the email and role." },
        { status: 400 }
      );
    }
    
    // Handle "record not found" error from Prisma (P2025)
    if (err.code === 'P2025') {
      return NextResponse.json(
        { error: "User not found with the provided email." },
        { status: 404 }
      );
    }

    // Handle all other unexpected errors
    return NextResponse.json(
      { error: "An unexpected error occurred while updating the user role." },
      { status: 500 }
    );
  }
}
