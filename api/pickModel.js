// api/pickModel.js
export const config = { runtime: "edge" };   // บอก Vercel ให้รัน Edge

// URL ไฟล์กฎ + quota API
const RULES_URL = "https://raw.githubusercontent.com/music256/kk-gpt/main/rules_v1.json";
const QUOTA_URL = "https://kk-gpt-zeta.vercel.app/api/quota";

// helper ดึง JSON พร้อม cache 1 นาที (Edge จะจัดการให้)
const json = (url, ttl = 60) =>
  fetch(url, { next: { revalidate: ttl } }).then(r => r.json());

export default async request => {
  const room = new URL(request.url).searchParams.get("room");
  if (!room) {
    return new Response('{"error":"missing room"}', { status: 400 });
  }

  // 1) โหลดกฎ
  const RULES = await json(RULES_URL);
  if (!RULES[room]) {
    return new Response('{"error":"unknown room"}', { status: 400 });
  }

  // 2) โหลด quota
  const quota = await json(QUOTA_URL);

  // 3) เลือกโมเดลตาม priority + quota
  const { priority, reasons } = RULES[room];
  const pick =
    priority.find(m => {
      const q = quota.models?.[m];
      return q && (q.limit === "unlimited" || (q.used ?? 0) < q.limit);
    }) || null;

  // 4) ตอบกลับ
  return new Response(
    JSON.stringify({ model: pick, reason: reasons[pick] || null }),
    { headers: { "content-type": "application/json" } }
  );
};