"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ImageUpload from "./ImageUpload";

type Diary = {
  id: number;
  date: string;
  title: string;
  summary: string;
  tags?: string[];
  pinned?: boolean;
};

type Profile = {
  name: string;
  signature: string;
  avatar: string;
  location: string;
  industry: string;
  zodiac: string;
  headerBg: string;
};

export default function AdminPage() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
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

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch(() => setProfile(null));
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

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setProfileSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) setProfile(await res.json());
    } finally {
      setProfileSaving(false);
    }
  }

  if (loading) {
    return <p className="text-zinc-500">加载中…</p>;
  }

  return (
    <div>
      {/* 个人信息 */}
      {profile && (
        <section className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            个人信息（博客顶部展示）
          </h2>
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">姓名</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile((p) => p && { ...p, name: e.target.value })}
                className="mt-1 w-full max-w-md rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">签名</label>
              <input
                type="text"
                value={profile.signature}
                onChange={(e) => setProfile((p) => p && { ...p, signature: e.target.value })}
                placeholder="dailyrhapsody.data.blog"
                className="mt-1 w-full max-w-md rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">头像</label>
              <div className="mt-1">
                <ImageUpload
                  value={profile.avatar ? [profile.avatar] : []}
                  onChange={(urls) => setProfile((p) => p && { ...p, avatar: urls[0] ?? "" })}
                  maxCount={1}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">位置</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile((p) => p && { ...p, location: e.target.value })}
                placeholder="杭州"
                className="mt-1 w-full max-w-md rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">行业</label>
              <input
                type="text"
                value={profile.industry}
                onChange={(e) => setProfile((p) => p && { ...p, industry: e.target.value })}
                placeholder="计算机硬件行业"
                className="mt-1 w-full max-w-md rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">星座</label>
              <input
                type="text"
                value={profile.zodiac}
                onChange={(e) => setProfile((p) => p && { ...p, zodiac: e.target.value })}
                placeholder="天秤座"
                className="mt-1 w-full max-w-md rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">顶部背景图</label>
              <div className="mt-1">
                <ImageUpload
                  value={profile.headerBg ? [profile.headerBg] : []}
                  onChange={(urls) => setProfile((p) => p && { ...p, headerBg: urls[0] ?? "" })}
                  maxCount={1}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={profileSaving}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {profileSaving ? "保存中…" : "保存个人信息"}
            </button>
          </form>
        </section>
      )}

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

      <ul className="space-y-4">
        {diaries.map((d) => (
          <li
            key={d.id}
            className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="shrink-0 text-[0.7rem] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                  {d.date}
                </span>
                {d.pinned && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[0.65rem] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                    置顶
                  </span>
                )}
                <h2 className="text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
                  {d.title || "（无标题）"}
                </h2>
              </div>
              {(d.tags ?? []).length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {(d.tags ?? []).map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-[0.65rem] text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {d.summary && (
                <p className="mt-2 line-clamp-3 whitespace-pre-line text-[0.82rem] leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {d.summary}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-0.5 sm:pt-0.5">
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
          </li>
        ))}
      </ul>
    </div>
  );
}
