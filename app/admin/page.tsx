"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Diary = {
  id: number;
  date: string;
  title: string;
  summary: string;
  tags?: string[];
};

export default function AdminPage() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/diaries");
      const data = await res.json();
      setDiaries(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function seed() {
    setSeedLoading(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) await load();
    } finally {
      setSeedLoading(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("确定删除这篇？")) return;
    const res = await fetch(`/api/diaries/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  if (loading) {
    return <p className="text-zinc-500">加载中…</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          文章列表（共 {diaries.length} 篇）
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={seed}
            disabled={seedLoading}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {seedLoading ? "初始化中…" : "从静态数据初始化"}
          </button>
          <Link
            href="/admin/diaries/new"
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            新建
          </Link>
        </div>
      </div>

      <ul className="max-w-2xl divide-y divide-zinc-200 dark:divide-zinc-800">
        {diaries.map((d) => (
          <li key={d.id} className="flex gap-3 px-1 py-3 first:pt-0">
            {/* 左侧占位：类似推特的头像列 */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-600 dark:bg-zinc-600 dark:text-zinc-300">
              {(d.title || "文")[0]}
            </div>
            <div className="min-w-0 flex-1">
              {/* 第一行：标题 · 日期 */}
              <div className="flex flex-wrap items-baseline gap-1">
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {d.title || "（无标题）"}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  · {d.date}
                </span>
              </div>
              {/* 正文 */}
              {d.summary && (
                <p className="mt-0.5 line-clamp-3 whitespace-pre-wrap text-[15px] leading-snug text-zinc-700 dark:text-zinc-300">
                  {d.summary}
                </p>
              )}
              {/* 标签 + 操作栏：类似推特的互动区 */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {(d.tags ?? []).length > 0 ? (d.tags ?? []).join(" · ") : "\u00A0"}
                </span>
                <div className="flex items-center gap-0.5">
                  <Link
                    href={`/admin/diaries/${d.id}/edit`}
                    className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    title="编辑"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(d.id)}
                    className="rounded-full p-2 text-zinc-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                    title="删除"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
