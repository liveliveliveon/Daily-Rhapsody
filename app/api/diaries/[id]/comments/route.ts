import { NextResponse } from "next/server";
import { getComments, addComment } from "@/lib/comments-store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const diaryId = Number(id);
  if (!Number.isInteger(diaryId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const comments = await getComments(diaryId);
  return NextResponse.json(comments);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const diaryId = Number(id);
  if (!Number.isInteger(diaryId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  let body: { author?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const author = (body.author ?? "").trim().slice(0, 64) || "匿名";
  const content = (body.content ?? "").trim().slice(0, 2000);
  if (!content) {
    return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
  }
  const comment = await addComment({ diaryId, author, content });
  return NextResponse.json(comment);
}
