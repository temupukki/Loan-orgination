import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (await params).id; // Keep as string since your DB uses string IDs
    
    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (session.user.id === userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}