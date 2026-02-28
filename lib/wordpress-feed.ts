const WP_SITE = "dailyrhapsody.data.blog";
const WP_API = `https://public-api.wordpress.com/rest/v1.1/sites/${WP_SITE}/posts`;

/** 从 WordPress 抓取每篇文章的精确发布时间，返回 id -> ISO date 的映射 */
export async function fetchWordPressPublishTimes(): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  let page = 1;
  const perPage = 100;
  while (true) {
    const url = `${WP_API}?number=${perPage}&page=${page}&order=ASC&order_by=date`;
    const res = await fetch(url);
    if (!res.ok) break;
    const data = await res.json();
    const posts = data?.posts;
    if (!Array.isArray(posts) || posts.length === 0) break;
    for (const p of posts) {
      if (p.ID != null && p.date) map.set(Number(p.ID), p.date);
    }
    if (posts.length < perPage) break;
    page += 1;
  }
  return map;
}
