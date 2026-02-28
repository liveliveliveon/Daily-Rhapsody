import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getProfile, saveProfile } from "@/lib/profile-store";

export async function GET() {
  const profile = await getProfile();
  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  const ok = await isAdmin();
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: Partial<{
    name: string;
    signature: string;
    avatar: string;
    location: string;
    industry: string;
    zodiac: string;
    headerBg: string;
  }>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const profile = await saveProfile({
    name: body.name,
    signature: body.signature,
    avatar: body.avatar,
    location: body.location,
    industry: body.industry,
    zodiac: body.zodiac,
    headerBg: body.headerBg,
  });
  return NextResponse.json(profile);
}
