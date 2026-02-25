"use client";

import { useEffect, useState } from "react";

type Diary = {
  id: number;
  date: string;
  title: string;
  summary: string;
};

const PAGE_SIZE = 10;

export default function Home() {
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const [totalPosts, setTotalPosts] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [inputPage, setInputPage] = useState<string>("1");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://public-api.wordpress.com/wp/v2/sites/dailyrhapsody.data.blog/posts?per_page=${PAGE_SIZE}&page=${page}`
        );

        if (!res.ok) {
          throw new Error("Failed to load posts");
        }

        const total = Number(res.headers.get("X-WP-Total") ?? "0");
        const totalPagesHeader = Number(
          res.headers.get("X-WP-TotalPages") ?? "0"
        );

        const data = await res.json();
        if (cancelled) return;

        const mapped: Diary[] = data.map((post: any) => ({
          id: post.id,
          date: (post.date as string).slice(0, 10),
          title: post.title?.rendered?.replace(/<[^>]+>/g, "") ?? "",
          summary: post.excerpt?.rendered
            ? post.excerpt.rendered.replace(/<[^>]+>/g, "").trim()
            : "",
        }));

        setEntries(mapped);
        setIsLastPage(
          mapped.length < PAGE_SIZE || (totalPagesHeader > 0 && page >= totalPagesHeader)
        );
        setTotalPosts(Number.isFinite(total) && total > 0 ? total : null);
        setTotalPages(
          Number.isFinite(totalPagesHeader) && totalPagesHeader > 0
            ? totalPagesHeader
            : null
        );
      } catch (e) {
        if (!cancelled) {
          setError("加载文章失败");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    setInputPage(String(page));
  }, [page]);

  const applyPageInput = (raw: string) => {
    const target = Number(raw);
    if (!Number.isFinite(target)) {
      setInputPage(String(page));
      return;
    }
    const maxPage =
      totalPages && totalPages > 0 ? totalPages : Math.max(page, 1);
    const next = Math.min(Math.max(1, target), maxPage);
    setPage(next);
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-white px-4 py-10 font-sans text-zinc-900 dark:from-black dark:via-zinc-950 dark:to-black dark:text-zinc-50">
      <main className="mx-auto flex max-w-3xl flex-col">
        {/* 英雄区 */}
        <header className="mb-12">
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Daily Rhapsody
          </h1>
          <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
            I think, therefore I am.
          </p>
        </header>

        {/* 日记列表 */}
        <section className="space-y-4 border-t border-zinc-200 pt-6 text-sm dark:border-zinc-800">
          {loading && (
            <p className="px-3 text-xs text-zinc-500 dark:text-zinc-400">
              正在从 WordPress 同步文章…
            </p>
          )}

          {error && !loading && (
            <p className="px-3 text-xs text-red-500 dark:text-red-400">
              {error}
            </p>
          )}

          {!loading &&
            !error &&
            entries.map((item) => (
              <article
                key={item.id}
                className="group flex gap-4 rounded-2xl px-3 py-4 transition hover:bg-zinc-100/70 dark:hover:bg-zinc-900/80"
              >
                <div className="mt-1 shrink-0 text-[0.7rem] uppercase tracking-[0.18em] text-zinc-500 whitespace-nowrap dark:text-zinc-500">
                  {item.date}
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-medium tracking-tight group-hover:text-zinc-950 dark:group-hover:text-zinc-50">
                    {item.title}
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-[0.82rem] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.summary}
                  </p>
                </div>
              </article>
            ))}
        </section>

        {/* 分页 */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4 text-[0.75rem] text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-full border border-zinc-300 px-3 py-1 transition disabled:opacity-40 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            上一页
          </button>

          <div className="flex items-center gap-2">
            <span>第</span>
            <input
              type="number"
              min={1}
              max={totalPages ?? undefined}
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onBlur={() => applyPageInput(inputPage)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyPageInput(inputPage);
                }
              }}
              className="flex h-7 w-14 items-center justify-center rounded-full border border-zinc-300 bg-transparent px-2 text-center text-[0.8rem] leading-none outline-none appearance-none focus:border-zinc-500 dark:border-zinc-700 dark:appearance-none dark:focus:border-zinc-400"
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
              if (!isLastPage) setPage((p) => p + 1);
            }}
            disabled={isLastPage}
            className="rounded-full border border-zinc-300 px-3 py-1 transition disabled:opacity-40 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            下一页
          </button>
        </div>

        {/* 底部细线签名 */}
        <footer className="mt-10 border-t border-zinc-200 pt-4 text-[0.7rem] text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          <span>© {new Date().getFullYear()} Daily Rhapsody</span>
        </footer>
      </main>
    </div>
  );
}
