import fetchQuotaJson from "../../lib/fetchQuota";

export default async function handler(req, res) {
  const data = await fetchQuotaJson();
  if (!data || !data.models) {
    return res.status(503).send("Quota not available");
  }

  const csv = [
    "Model,Quota,Period",
    ...Object.entries(data.models).map(([model, info]) =>
      [model, info.quota, info.period || "-"].join(",")
    )
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.status(200).send(csv);
}
