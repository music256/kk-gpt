export const config = { runtime: "edge" };

import yaml from "js-yaml";

const RULES_URL  = "https://raw.githubusercontent.com/music256/kk-gpt/main/rules_v1.yml";
const QUOTA_URL  = "https://kk-gpt-zeta.vercel.app/api/quota";

// --- helper ---
const fetchJson = url => fetch(url).then(r => r.json());
const fetchRules = async () =>
  yaml.load(await fetch(RULES_URL, { next:{ revalidate:60 } }).then(r => r.text()));

// --- handler ---
export default async req => {
  const params = new URL(req.url).searchParams;
  const room   = params.get("room");
  if (!room)   return new Response(`{"error":"missing ?room="}`, {status:400});

  const RULES  = await fetchRules();
  if (!RULES[room])
    return new Response(`{"error":"unknown room"}`, {status:400});

  const quota  = await fetchJson(QUOTA_URL);

  const { priority, reasons } = RULES[room];
  const pick = priority.find(m=>{
    const q = quota.models?.[m];
    return q && (q.limit==="unlimited" || (q.used??0) < q.limit);
  }) || null;

  return new Response(
    JSON.stringify({ model: pick, reason: reasons[pick] || null }),
    { headers:{ "content-type":"application/json" } }
  );
};
