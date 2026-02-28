import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export type Profile = {
  name: string;
  signature: string;
  avatar: string;
  location: string;
  industry: string;
  zodiac: string;
  headerBg: string;
};

const DEFAULT_PROFILE: Profile = {
  name: "DailyRhapsody",
  signature: "君子论迹不论心",
  avatar: "/avatar.png",
  location: "杭州",
  industry: "计算机硬件行业",
  zodiac: "天秤座",
  headerBg: "/header-bg.png",
};

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "profile.json");

async function readFromFile(): Promise<Profile | null> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

async function writeToFile(profile: Profile): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(profile, null, 2), "utf8");
}

export async function getProfile(): Promise<Profile> {
  const p = await readFromFile();
  if (p) return { ...DEFAULT_PROFILE, ...p };
  return { ...DEFAULT_PROFILE };
}

export async function saveProfile(updates: Partial<Profile>): Promise<Profile> {
  const current = await getProfile();
  const next: Profile = { ...current, ...updates };
  await writeToFile(next);
  return next;
}
