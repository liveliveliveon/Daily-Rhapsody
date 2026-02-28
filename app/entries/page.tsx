"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Diary = {
  id: number;
  date: string;
  publishedAt?: string;
  title: string;
  summary: string;
  tags?: string[];
  images?: string[];
};

type Comment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

const PAGE_SIZE = 10;
const AUTHOR_NAME = "滕君";

/** 支持 ISO 或 YYYY-MM-DD，输出 2026/9/10, 12:00PM */
function formatDate12h(dateOrIso: string): string {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(dateOrIso)
    ? new Date(dateOrIso + "T12:00:00")
    : new Date(dateOrIso);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const h = d.getHours() % 12 || 12;
  const min = String(d.getMinutes()).padStart(2, "0");
  const ampm = d.getHours() < 12 ? "AM" : "PM";
  return `${y}/${m}/${day}, ${h}:${min}${ampm}`;
}

function getTagCounts(diaries: { tags?: string[] }[]) {
  const count = new Map<string, number>();
  for (const d of diaries) {
    const tags = d.tags ?? [];
    for (const t of tags) {
      count.set(t, (count.get(t) ?? 0) + 1);
    }
  }
  return Array.from(count.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function getSizeClass(count: number, maxCount: number) {
  if (maxCount <= 0) return "text-xs";
  const r = count / maxCount;
  if (r >= 0.7) return "text-base sm:text-lg";
  if (r >= 0.4) return "text-sm sm:text-base";
  if (r >= 0.2) return "text-xs sm:text-sm";
  return "text-[0.65rem] sm:text-xs";
}

function DefaultAvatar({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  const sizeClass = className ?? "h-10 w-10";
  if (failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-zinc-300 text-xs font-medium text-zinc-600 dark:bg-zinc-600 dark:text-zinc-300 ${sizeClass}`}
        aria-hidden
      >
        滕
      </div>
    );
  }
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700 ${sizeClass}`}
      aria-hidden
    >
      <Image
        src="/avatar.png"
        alt=""
        width={40}
        height={40}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function EntryComments({
  diaryId,
  open,
  onOpenChange,
}: {
  diaryId: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/diaries/${diaryId}/comments`)
      .then((r) => r.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [diaryId, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const a = author.trim().slice(0, 64) || "匿名";
    const c = content.trim().slice(0, 2000);
    if (!c) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/diaries/${diaryId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: a, content: c }),
      });
      const data = await res.json();
      if (data.id) setComments((prev) => [...prev, data]);
      setContent("");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;
  return (
    <div className="mt-2 space-y-2 rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/30">
      <div className="flex items-center justify-between">
        <span className="text-[0.75rem] text-zinc-500">评论</span>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="text-[0.75rem] text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-400"
        >
          收起（{comments.length}）
        </button>
      </div>
      {loading && <p className="text-xs text-zinc-500">加载中…</p>}
      {!loading && comments.length === 0 && (
        <p className="text-xs text-zinc-500">暂无评论</p>
      )}
      {!loading &&
        comments.map((c) => (
          <div key={c.id} className="text-[0.8rem]">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {c.author}
            </span>
            <span className="ml-1.5 text-zinc-500 dark:text-zinc-400">
              {new Date(c.createdAt).toLocaleString("zh-CN", { hour12: false })}
            </span>
            <p className="mt-0.5 whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
              {c.content}
            </p>
          </div>
        ))}
      <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="昵称（可选）"
          className="rounded border border-zinc-300 bg-white px-2 py-1 text-[0.8rem] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写一条评论…"
          rows={2}
          className="rounded border border-zinc-300 bg-white px-2 py-1 text-[0.8rem] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-fit rounded bg-zinc-800 px-3 py-1 text-[0.8rem] text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {submitting ? "发送中…" : "发送"}
        </button>
      </form>
    </div>
  );
}

function EntryCard({ item }: { item: Diary }) {
  const ref = useRef<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [sharing, setSharing] = useState(false);

  async function runShare() {
    const article = ref.current;
    if (!article || sharing) return;
    setSharing(true);
    setMenuOpen(false);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(article, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: undefined,
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png", 0.95)
      );
      if (!blob) throw new Error("生成图片失败");
      const file = new File([blob], "snapshot.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "DailyRhapsody",
          text: "分享自 DailyRhapsody",
        });
      } else if (navigator.share) {
        await navigator.share({
          title: "DailyRhapsody",
          text: "分享自 DailyRhapsody",
          url: typeof window !== "undefined" ? window.location.href : "",
        });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "snapshot.png";
        a.click();
        URL.revokeObjectURL(a.href);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") console.error(err);
    } finally {
      setSharing(false);
    }
  }

  const timeStr = formatDate12h(
    item.publishedAt ?? item.date + "T12:00:00"
  );

  return (
    <article
      ref={ref}
      className="group relative flex flex-col gap-3 rounded-2xl px-3 py-4 transition-apple hover:bg-zinc-100/70 hover:shadow-md dark:hover:bg-zinc-900/80 dark:hover:shadow-black/10"
    >
      <div className="flex items-start gap-3">
        <DefaultAvatar className="h-10 w-10 shrink-0" />
        <div className="min-h-10 flex min-w-0 flex-1 flex-col justify-center">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {AUTHOR_NAME}
          </p>
          <p className="text-[0.75rem] text-zinc-500 dark:text-zinc-400">
            {timeStr}
          </p>
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
            aria-label="更多"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="6" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="18" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                aria-hidden="true"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 min-w-[6rem] rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => {
                    setCommentsOpen(true);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-[0.8rem] text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  评论
                </button>
                <button
                  type="button"
                  onClick={runShare}
                  disabled={sharing}
                  className="w-full px-3 py-2 text-left text-[0.8rem] text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {sharing ? "生成中…" : "分享"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {(item.images ?? []).length > 0 && (
        <div className="flex gap-1 overflow-hidden rounded-xl">
          {item.images!.slice(0, 3).map((src) => (
            <div
              key={src}
              className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800 sm:h-20 sm:w-20"
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          ))}
        </div>
      )}
      <p className="whitespace-pre-line text-[0.82rem] leading-relaxed text-zinc-600 dark:text-zinc-400">
        {item.summary}
      </p>
      <div className="flex flex-col items-start gap-1">
        {(item.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(item.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-[0.65rem] text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <EntryComments
          diaryId={item.id}
          open={commentsOpen}
          onOpenChange={setCommentsOpen}
        />
      </div>
    </article>
  );
}

export default function EntriesPage() {
  const [page, setPage] = useState(1);
  const [inputPage, setInputPage] = useState<string>("1");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allDiaries, setAllDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const [entriesFlipped, setEntriesFlipped] = useState(false);

  useEffect(() => {
    fetch("/api/diaries")
      .then((res) => res.json())
      .then((data) => setAllDiaries(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  // 进入页面时触发翻转动画
  useEffect(() => {
    const t = setTimeout(() => setEntriesFlipped(true), 80);
    return () => clearTimeout(t);
  }, []);

  const filteredDiaries = useMemo(() => {
    if (!selectedTag) return allDiaries;
    return allDiaries.filter((d) => (d.tags ?? []).includes(selectedTag));
  }, [selectedTag, allDiaries]);

  const tagCounts = useMemo(() => getTagCounts(allDiaries), [allDiaries]);
  const maxTagCount = tagCounts[0]?.value ?? 1;

  const totalPosts = filteredDiaries.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages && totalPages >= 1) {
      setPage(totalPages);
      setInputPage(String(totalPages));
    }
  }, [totalPages, page]);

  const currentEntries = filteredDiaries.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const applyPageInput = (raw: string) => {
    const target = Number(raw);
    if (!Number.isFinite(target)) {
      setInputPage(String(page));
      return;
    }
    const next = Math.min(Math.max(1, target), totalPages);
    setPage(next);
    setInputPage(String(next));
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag((prev) => (prev === tag ? null : tag));
    setPage(1);
    setInputPage("1");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-white font-sans text-zinc-900 dark:from-black dark:via-zinc-950 dark:to-black dark:text-zinc-50">
      <div className="entries-flip-wrapper pt-4">
        <main
          id="entries"
          className={`entries-flip-panel mx-auto flex max-w-3xl flex-col px-4 pt-12 pb-10 ${entriesFlipped ? "entries-flip-visible" : ""}`}
        >
          {/* 返回首页 */}
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            <Link
              href="/"
              className="transition-apple hover:text-zinc-900 dark:hover:text-zinc-100 underline focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 rounded"
            >
              ← 返回首页
            </Link>
          </p>

          {/* 标签词云 */}
          {tagCounts.length > 0 && (
            <section className="mb-10 rounded-2xl border border-zinc-200 bg-white/60 px-4 py-5 shadow-sm transition-apple dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="mb-3 text-[0.7rem] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                标签
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {tagCounts.map(({ name, value }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleTagClick(name)}
                    className={`rounded-full px-2.5 py-1 transition-apple focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 ${getSizeClass(value, maxTagCount)} ${
                      selectedTag === name
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:scale-105 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
              {selectedTag && (
                <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                  当前筛选：{selectedTag}（共 {totalPosts} 篇）
                  <button
                    type="button"
                    onClick={() => handleTagClick(selectedTag)}
                    className="ml-2 rounded underline transition-apple hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
                  >
                    取消
                  </button>
                </p>
              )}
            </section>
          )}

          {/* 日记列表：翻页时淡入 */}
          <section
            key={page}
            className="entries-page-fade-in space-y-4 border-t border-zinc-200 pt-6 text-sm dark:border-zinc-800"
          >
            {loading && (
              <p className="px-3 text-xs text-zinc-500 dark:text-zinc-400">
                加载中…
              </p>
            )}
            {!loading && currentEntries.length === 0 && (
              <p className="px-3 text-xs text-zinc-500 dark:text-zinc-400">
                暂无文章
              </p>
            )}
            {!loading &&
              currentEntries.map((item) => (
                <EntryCard key={item.id} item={item} />
              ))}
          </section>

          {/* 分页 */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4 text-[0.75rem] text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
            <button
              type="button"
              onClick={() =>
                setPage((p) => {
                  const next = Math.max(1, p - 1);
                  setInputPage(String(next));
                  return next;
                })
              }
              disabled={page === 1}
              className="rounded-full border border-zinc-300 px-3 py-1 transition-apple disabled:opacity-40 hover:scale-[1.02] hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 dark:border-zinc-700 dark:hover:bg-zinc-900 dark:focus:ring-offset-zinc-950"
            >
              上一页
            </button>

            <div className="flex items-center gap-2">
              <span>第</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onBlur={() => applyPageInput(inputPage)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyPageInput(inputPage);
                  }
                }}
                className="pagination-page-input flex h-7 w-14 items-center justify-center rounded-full border border-zinc-300 bg-transparent px-2 text-center text-[0.8rem] leading-none outline-none transition-apple focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-700 dark:focus:border-zinc-400"
              />
              <span>
                页
                {totalPages ? ` / 共 ${totalPages} 页` : ""}
                {totalPosts ? ` · 共 ${totalPosts} 篇` : ""}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (page < totalPages)
                  setPage((p) => {
                    const next = Math.min(totalPages, p + 1);
                    setInputPage(String(next));
                    return next;
                  });
              }}
              disabled={page >= totalPages}
              className="rounded-full border border-zinc-300 px-3 py-1 transition-apple disabled:opacity-40 hover:scale-[1.02] hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 dark:border-zinc-700 dark:hover:bg-zinc-900 dark:focus:ring-offset-zinc-950"
            >
              下一页
            </button>
          </div>

          <footer className="mt-10 border-t border-zinc-200 pt-4 text-[0.7rem] text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
            <span>© {new Date().getFullYear()} DailyRhapsody</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
