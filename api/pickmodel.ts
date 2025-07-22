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
    // โหลด YAML สดจาก GitHub (แทน fs)
    const yamlRes = await fetch('https://raw.githubusercontent.com/music256/kk-gpt/main/rules_v1.yml');
    const yamlText = await yamlRes.text();
    const rules = yaml.load(yamlText) as any;

    if (!rules[room]) {
      return res.status(400).json({ error: `Unknown room "${room}"` });
    }

    const { allowed, priority, reasons } = rules[room];

    // โหลดข้อมูล quota สด
    const quotaRes = await fetch('https://kk-gpt-zeta.vercel.app/api/quota');
    const quotaData = await quotaRes.json();

    const candidates = priority.filter((model: string) => {
      const q = quotaData[model] || quotaData.models?.[model];
      if (!q) return false;
      return q.limit === 'unlimited' || q.used < q.limit;
    });

    const best = candidates[0] || null;

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ model: best, reason: reasons[best] || null });

  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
