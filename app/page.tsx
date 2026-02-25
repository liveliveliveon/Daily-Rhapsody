"use client";

import Cover from "./components/Cover";

export default function Home() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-zinc-100 to-white font-sans text-zinc-900 dark:from-black dark:via-zinc-950 dark:to-black dark:text-zinc-50">
      <Cover />
    </div>
  );
}
