import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const member = await prisma.familyMember.findFirst({
      where: { id, userId: authUser.userId },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    await prisma.familyMember.delete({ where: { id } });

    return NextResponse.json({ message: "Member deleted" });
  } catch (error) {
    console.error("Delete family member error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
