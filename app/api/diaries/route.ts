import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getDiaries, saveDiaries, nextId, type Diary } from "@/lib/diaries-store";
import { allDiaries } from "@/app/diaries.data";
import { fetchWordPressPublishTimes } from "@/lib/wordpress-feed";

export async function GET() {
  const diaries = await getDiaries(allDiaries);
  try {
    const wpTimes = await fetchWordPressPublishTimes();
    const enriched = diaries.map((d) => ({
      ...d,
      publishedAt: wpTimes.get(d.id) ?? d.publishedAt,
    }));
    enriched.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (
        new Date(b.publishedAt ?? b.date).getTime() -
        new Date(a.publishedAt ?? a.date).getTime()
      );
    });
    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json(diaries);
  }
}

export async function POST(req: Request) {
  const ok = await isAdmin();
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { date?: string; title?: string; summary?: string; tags?: string[]; images?: string[]; pinned?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const diaries = await getDiaries(allDiaries);
  if (body.pinned) {
    const existing = diaries.find((d) => d.pinned);
    if (existing) {
      return NextResponse.json(
        { error: "已有置顶博客，请先在编辑页取消该篇置顶后再设置本文置顶。" },
        { status: 400 }
      );
    }
  }
  const id = nextId(diaries);
  const newDiary: Diary = {
    id,
    date: body.date ?? new Date().toISOString().slice(0, 10),
    pinned: !!body.pinned,
    title: body.title ?? "",
    summary: body.summary ?? "",
    tags: Array.isArray(body.tags) ? body.tags : [],
    images: Array.isArray(body.images) ? body.images : [],
  };
  diaries.unshift(newDiary);
  diaries.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (
      new Date(b.publishedAt ?? b.date).getTime() -
      new Date(a.publishedAt ?? a.date).getTime()
    );
  });
  await saveDiaries(diaries);
  return NextResponse.json(newDiary);
}
