"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Diary = {
  id: number;
  date: string;
  publishedAt?: string;
  summary: string;
  tags?: string[];
  images?: string[];
};

export default function TheMomentPage() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/diaries")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setDiaries(list.filter((d: Diary) => (d.images ?? []).length > 0));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-white font-sans text-zinc-900 dark:from-black dark:via-zinc-950 dark:to-black dark:text-zinc-50">
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-zinc-500 transition-opacity hover:opacity-80 dark:text-zinc-400"
        >
          ← 返回首页
        </Link>
        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
          The Moment
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          THE MOMENT
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          记录当下。发博客时上传的图片会出现在这里，类似朋友圈 / Ins 发帖。
        </p>

        {loading && (
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">加载中…</p>
        )}
        {!loading && diaries.length === 0 && (
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
            暂无带图片的瞬间。在后台写博客时上传图片即可出现在这里。
          </p>
        )}
        {!loading && diaries.length > 0 && (
          <div className="mt-6 space-y-6">
            {diaries.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-apple hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                {/* 多图：首图大图或横向滑动感，其余小图 */}
                <div className="flex flex-col">
                  <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-800">
                    <Image
                      src={item.images![0]}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 672px) 100vw, 672px"
                      priority={false}
                    />
                  </div>
                  {item.images!.length > 1 && (
                    <div className="flex gap-1 overflow-x-auto p-2">
                      {item.images!.slice(1, 6).map((src) => (
                        <div
                          key={src}
                          className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800"
                        >
                          <Image
                            src={src}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    DailyRhapsody
                  </p>
                  <p className="text-[0.75rem] text-zinc-500 dark:text-zinc-400">
                    {(() => {
                      const d = new Date(
                        item.publishedAt ?? item.date + "T12:00:00"
                      );
                      const y = d.getFullYear();
                      const m = d.getMonth() + 1;
                      const day = d.getDate();
                      const h = d.getHours() % 12 || 12;
                      const min = String(d.getMinutes()).padStart(2, "0");
                      const ampm = d.getHours() < 12 ? "AM" : "PM";
                      return `${y}/${m}/${day} ${h}:${min}${ampm}`;
                    })()}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-3">
                    {item.summary}
                  </p>
                  {(item.tags ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
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
                </div>
              </article>
            ))}
          </div>
        )}

        <footer className="mt-6 border-t border-zinc-200 pt-5 text-[0.7rem] text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          <span>© {new Date().getFullYear()} DailyRhapsody</span>
        </footer>
      </main>
    </div>
  );
}
