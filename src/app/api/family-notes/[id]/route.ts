import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const note = await prisma.familyNote.findFirst({
      where: { id, userId: authUser.userId },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const updatedNote = await prisma.familyNote.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ note: updatedNote });
  } catch (error) {
    console.error("Update family note error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

    const note = await prisma.familyNote.findFirst({
      where: { id, userId: authUser.userId },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await prisma.familyNote.delete({ where: { id } });

    return NextResponse.json({ message: "Note deleted" });
  } catch (error) {
    console.error("Delete family note error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
