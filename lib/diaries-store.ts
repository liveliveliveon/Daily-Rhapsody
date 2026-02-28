import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export type Diary = {
  id: number;
  date: string;
  /** 实际发布时间（ISO），从 WordPress 等拉取后可写入，用于显示精确到分钟 */
  publishedAt?: string;
  /** 是否置顶，最多一篇 */
  pinned?: boolean;
  summary: string;
  tags?: string[];
  images?: string[];
};

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "diaries.json");

async function readFromFile(): Promise<Diary[] | null> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

async function writeToFile(diaries: Diary[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(diaries, null, 2), "utf8");
}

export async function getDiaries(fallback: Diary[]): Promise<Diary[]> {
  const fromFile = await readFromFile();
  if (fromFile && fromFile.length > 0) return fromFile;
  return fallback;
}

export async function saveDiaries(diaries: Diary[]): Promise<void> {
  await writeToFile(diaries);
}

export function nextId(diaries: Diary[]): number {
  if (diaries.length === 0) return 1;
  return Math.max(...diaries.map((d) => d.id), 0) + 1;
}
