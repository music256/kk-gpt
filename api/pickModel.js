// api/pickModel.js
export const config = { runtime: "edge" };

const RULES_URL =
  "https://raw.githubusercontent.com/music256/kk-gpt/main/rules_v1.json";
const QUOTA_URL =
  "https://kk-gpt-zeta.vercel.app/api/quota";

// fetch helper (cache 60 วินาที)
const fetchJson = (url) => fetch(url, { next: { revalidate: 60 } }).then(r => r.json());

export default async (req) => {
  const room = new URL(req.url).searchParams.get("room");
  if (!room) return new Response('{"error":"missing room"}', { status: 400 });

  const RULES = await fetchJson(RULES_URL);
  if (!RULES[room])
    return new Response('{"error":"unknown room"}', { status: 400 });

  const quota = await fetchJson(QUOTA_URL);
  const { priority, reasons } = RULES[room];

  const pick =
    priority.find(m => {
      const q = quota.models?.[m];
      return q && (q.limit === "unlimited" || (q.used ?? 0) < q.limit);
    }) || null;

  return new Response(
    JSON.stringify({ model: pick, reason: reasons[pick] || null }),
    { headers: { "content-type": "application/json" } }
  );
};