// 一次性导出脚本：从 WordPress 拉取文章生成 app/diaries.data.ts（仅需在迁移时运行）
// 应用运行时不再请求 WordPress，数据全部来自本地/服务器存储。
// 运行方式：在项目根目录执行  node scripts/export-wordpress.mjs

import fs from "node:fs";
import path from "node:path";

const SITE = "dailyrhapsody.data.blog";
const PER_PAGE = 100;
const API_BASE = `https://public-api.wordpress.com/wp/v2/sites/${SITE}`;

const stripHtml = (html) =>
  html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

async function fetchAllTags() {
  const idToName = new Map();
  let page = 1;
  while (page <= 5) {
    const res = await fetch(`${API_BASE}/tags?per_page=100&page=${page}`);
    if (!res.ok) break;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    for (const t of data) idToName.set(t.id, t.name || "");
    if (data.length < 100) break;
    page += 1;
    await new Promise((r) => setTimeout(r, 400));
  }
  return idToName;
}

async function fetchAllPosts() {
  const all = [];
  let page = 1;

  // 最多防御性抓 10 页（1000 篇）
  while (page <= 10) {
    const url = `${API_BASE}/posts?per_page=${PER_PAGE}&page=${page}`;
    console.log(`Fetching: ${url}`);

    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 400 || res.status === 404) {
        break;
      }
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      break;
    }

    all.push(...data);
    if (data.length < PER_PAGE) break;
    page += 1;
    if (data.length === PER_PAGE) {
      await new Promise((r) => setTimeout(r, 800));
    }
  }

  return all;
}

function mapToDiaries(posts, tagIdToName) {
  return posts
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .map((post) => {
      const rawDate = typeof post.date === "string" ? post.date : "";
      const date = rawDate.slice(0, 10);

      const titleHtml = post.title?.rendered ?? "";
      const excerptHtml = post.excerpt?.rendered ?? "";

      const title = stripHtml(titleHtml);
      const summary = stripHtml(excerptHtml || post.content?.rendered || "");

      const tagIds = Array.isArray(post.tags) ? post.tags : [];
      const tags = tagIds
        .map((id) => tagIdToName.get(id))
        .filter(Boolean);

      return {
        id: post.id,
        date,
        title,
        summary,
        tags,
      };
    });
}

async function main() {
  console.log("Fetching tags...");
  const tagIdToName = await fetchAllTags();
  console.log(`Tags: ${tagIdToName.size}`);

  const posts = await fetchAllPosts();
  console.log(`Total posts fetched: ${posts.length}`);

  const diaries = mapToDiaries(posts, tagIdToName);

  const outPath = path.join(
    process.cwd(),
    "app",
    "diaries.data.ts"
  );

  const fileContent =
    `export type Diary = {\n` +
    `  id: number;\n` +
    `  date: string;\n` +
    `  title: string;\n` +
    `  summary: string;\n` +
    `  tags?: string[];\n` +
    `};\n\n` +
    `export const allDiaries: Diary[] = ${JSON.stringify(
      diaries,
      null,
      2
    )};\n`;

  fs.writeFileSync(outPath, fileContent, "utf8");
  console.log(`Written ${diaries.length} diaries to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

