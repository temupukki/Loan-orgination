// app/api/users/[id]/route.ts
import  prisma  from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH /api/users/:id
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { role } = body;

    const updatedUser = await prisma.user.update({
      where: { id: (params.id) },
      data: { role },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
