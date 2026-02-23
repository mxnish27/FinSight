import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await prisma.familyMember.findMany({
      where: { userId: authUser.userId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Get family members error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, relation } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const member = await prisma.familyMember.create({
      data: {
        userId: authUser.userId,
        name: name.trim(),
        relation: relation || null,
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("Create family member error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
