"use client";

import { useState } from "react";

type Diary = {
  id: number;
  date: string;
  title: string;
  summary: string;
};

// TODO: 把 WordPress 上所有文章完整复制进这个数组
// id 可直接用 WordPress 的 post id，date 用 "YYYY-MM-DD" 字符串
const allDiaries: Diary[] = [
  {
    id: 489,
    date: "2026-02-18",
    title: "如梦如愿",
    summary: "又梦到了。",
  },
  {
    id: 488,
    date: "2026-02-06",
    title: "日记",
    summary: "打字打出了腱鞘炎😂",
  },
  {
    id: 487,
    date: "2026-01-26",
    title: "如梦如愿",
    summary:
      "又梦到了。\n\n梦到你和李思颖在说话，记不清聊天内容了，好像是说八卦，又似是说我的不好。但气氛就像以前一起吃饭一样融洽。\n\n李思颖面朝着我，我却看不到你的面容。",
  },
  {
    id: 483,
    date: "2025-11-29",
    title: "《亲密关系》",
    summary: "《亲密关系》读书随记（标签：爱情 / 她 / 成长 / 个体）。",
  },
  {
    id: 482,
    date: "2025-11-26",
    title: "日记",
    summary:
      "以前大家说我负能量很强，从大学持续到研究生毕业。自认为也是死气环绕，离经叛道。\n\n分手也被骂“反社会人格”。\n\n工作几年后，习惯于被说能量超强、没见过我比我能量更强的、你精力怎么这么旺盛。其实，也就“卷”而已。\n\n看不到的是，孤身走过的日日夜夜。\n\n关了灯 全都一个样\n\n心里的伤 无法分享\n\n生命 随年月流去 随白发老去\n\n随着你离去 快乐渺无音信\n\n随往事淡去 随梦境睡去\n\n随麻痹的心逐渐远去\n\n天下谁人不识君，天下谁人又识君呢？",
  },
  {
    id: 481,
    date: "2025-11-24",
    title: "日记",
    summary: "看《小巷人家》，该做的事就应该尽早做。\n\n毕业的恋人，有几对能走到一起呢？",
  },
  {
    id: 480,
    date: "2025-11-17",
    title: "如梦如愿",
    summary: "又梦到了。",
  },
  {
    id: 479,
    date: "2025-10-21",
    title: "日记",
    summary:
      "两年了。\n\n同事聊天时常有说时间过得真快，我却觉得度日如年。刻骨铭心的记忆，于我而言褪色宛如一遍遍抽筋剥皮、刮骨疗毒。\n\n我还是不明白，全心全意相处了五年的生离和死别有什么区别呢？一辈子都见不到了吗？难道就差在血缘关系和法定仪式？走着走着，笑着笑着，想着想着，突如其来就哭了。\n\n我好想你，宝宝。",
  },
  {
    id: 478,
    date: "2025-10-21",
    title: "日记",
    summary: "31了。生日快乐，妈妈辛苦了。\n\n分手两年了。",
  },
  {
    id: 477,
    date: "2025-10-16",
    title: "日记",
    summary:
      "我还是不明白，全心全意相处了五年的生离和死别有什么区别呢？一辈子都见不到了吗？难道差在血缘和法定仪式？\n\n走着走着，突如其来，笑着笑着，想着想着就哭了。\n\n我好想你，宝宝。",
  },
];

const PAGE_SIZE = 10;

export default function Home() {
  const [page, setPage] = useState(1);
  const [inputPage, setInputPage] = useState<string>("1");

  const totalPosts = allDiaries.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));
  const currentEntries = allDiaries.slice(
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
          {currentEntries.map((item) => (
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
              if (page < totalPages) setPage((p) => p + 1);
            }}
            disabled={page >= totalPages}
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
