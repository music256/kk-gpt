// api/pickModel.js
export const config = { runtime: "edge" };

import yaml from "js-yaml";

const RULES_URL =
  "https://raw.githubusercontent.com/music256/kk-gpt/main/rules_v1.yml";
const QUOTA_URL =
  "https://kk-gpt-zeta.vercel.app/api/quota";

// ดึง YAML (cache 60 วินาที)
async function getRules() {
  const res = await fetch(RULES_URL, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to load rules");
  return yaml.load(await res.text());
}

export default async request => {
  const room = new URL(request.url).searchParams.get("room");
  if (!room) {
    return new Response(
      JSON.stringify({ error: "missing ?room=" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  // ① โหลดกฎ
  const RULES = await getRules();
  if (!RULES[room]) {
    return new Response(
      JSON.stringify({ error: "unknown room" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  // ② โหลด quota
  const quota = await fetch(QUOTA_URL).then(r => r.json());

  // ③ เลือกโมเดลตาม priority + quota
  const { priority, reasons } = RULES[room];
  const pick = priority.find(m => {
    const q = quota.models?.[m];
    return q && (q.limit === "unlimited" || (q.used ?? 0) < q.limit);
  }) || null;

  return new Response(
    JSON.stringify({ model: pick, reason: reasons[pick] || null }),
    { headers: { "content-type": "application/json" } }
  );
};
