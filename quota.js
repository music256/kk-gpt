import fetchQuotaJson from "../../lib/fetchQuota";

export default async function handler(req, res) {
  const data = await fetchQuotaJson();
  if (!data) {
    return res.status(503).json({ error: "Quota file not available." });
  }
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
  res.status(200).json(data);
}
