import yaml from 'js-yaml';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  const room = req.query.room;
  if (!room) {
    return res.status(400).json({ error: 'Missing ?room=' });
  }

  try {
    // โหลด YAML จาก raw GitHub URL (public)
    const yamlRes = await fetch('https://raw.githubusercontent.com/music256/kk-gpt/main/api/rules_v1.yml');
    const yamlText = await yamlRes.text();
    const rules = yaml.load(yamlText) as any;

    if (!rules[room]) {
      return res.status(400).json({ error: `Unknown room "${room}"` });
    }

    // ดึง quota สด
    const quotaRes = await fetch('https://kk-gpt-zeta.vercel.app/api/quota');
    const quotaData = await quotaRes.json();

    const { allowed, priority, reasons } = rules[room];

    // กรองโมเดลที่ยังมี quota
    const candidates = priority.filter((model: string) => {
      const q = quotaData[model] || quotaData.models?.[model];
      if (!q) return false;
      return q.limit === 'unlimited' || q.used < q.limit;
    });

    const best = candidates[0] || null;

    res.setHeader('Cache-Control', 'no-store');
    return res.json({ model: best, reason: reasons[best] || null });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Server Error',
      details: err?.message || err.toString(),
    });
  }
}
