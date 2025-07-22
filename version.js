import fetchQuotaJson from "../../lib/fetchQuota";

export default async function handler(req, res) {
  const data = await fetchQuotaJson();
  if (!data) {
    return res.status(503).json({ error: "Quota not available" });
  }
  const { version, updated } = data;
  res.status(200).json({ version, updated });
}
