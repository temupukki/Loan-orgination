// app/api/users/[id]/route.ts
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// PATCH /api/users/:id
export async function PATCH(
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
    const userId = (await params).id;
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();
    const { role } = body;

    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "Cannot update your own account" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
