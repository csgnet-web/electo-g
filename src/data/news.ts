// ─── News API Client (Section 2.3) ───────────────────────────────────────────
// News monitoring per race for Monitor Agent ingestion.

const NEWS_API_KEY = process.env.NEWS_API_KEY ?? "";
const NEWS_API_BASE = "https://newsapi.org/v2";

export interface NewsArticle {
  headline: string;
  source: string;
  url: string;
  published_at: string;
}

/**
 * Fetch recent news articles about a race.
 * Used by Monitor Agent for the last 48 hours of coverage.
 */
export async function fetchRaceNews(
  raceId: string,
  state: string,
  candidateNames: string[],
  hoursBack: number = 48
): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    console.warn("[news] No NEWS_API_KEY configured — returning empty data");
    return [];
  }

  const query = [
    `"${state}" election 2026`,
    ...candidateNames.map((n) => `"${n}"`),
  ].join(" OR ");

  const from = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

  try {
    const params = new URLSearchParams({
      q: query,
      from,
      sortBy: "publishedAt",
      language: "en",
      pageSize: "20",
      apiKey: NEWS_API_KEY,
    });

    const res = await fetch(`${NEWS_API_BASE}/everything?${params}`);
    if (!res.ok) return [];

    const data = await res.json();
    return (data.articles ?? []).map((a: Record<string, unknown>) => ({
      headline: a.title as string,
      source: (a.source as Record<string, string>)?.name ?? "Unknown",
      url: a.url as string,
      published_at: a.publishedAt as string,
    }));
  } catch (error) {
    console.error(`[news] Error fetching news for ${raceId}:`, error);
    return [];
  }
}
