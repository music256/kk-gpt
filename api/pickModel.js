export const config = { runtime: "edge" };

import rulesYaml from "../rules_v1.yml";   // ¹   (Vercel auto-bundles)
import yaml from "js-yaml";

const RULES = yaml.load(rulesYaml);
const QUOTA_URL = "https://kk-gpt-zeta.vercel.app/api/quota";

export default async req => {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get("room");
  if (!RULES[room]) {
    return new Response(JSON.stringify({ error: "unknown room" }), { status: 400 });
  }

  const quota = await fetch(QUOTA_URL).then(r => r.json());

  const pick = RULES[room].priority.find(m => {
    const q = quota.models?.[m];
    return q && (q.limit === "unlimited" || (q.used ?? 0) < q.limit);
  }) || null;

  return new Response(
    JSON.stringify({ model: pick, reason: RULES[room].reasons[pick] || null }),
    { headers: { "content-type": "application/json" } }
  );
};
