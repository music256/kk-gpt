import yaml from 'js-yaml';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  try {
    const room = req.query.room;
    if (!room) {
      return res.status(400).json({ step: 'check-room', error: 'Missing ?room=' });
    }

    // โหลด YAML
    const rulesRes = await fetch(
      'https://raw.githubusercontent.com/music256/kk-gpt/main/api/rules_v1.yml'
    );
    const rulesText = await rulesRes.text();
    const rules = yaml.load(rulesText) as any;

    if (!rules[room]) {
      return res.status(400).json({ step: 'check-rules', error: `Unknown room "${room}"` });
    }

    // โหลด quota
    const quotaRes = await fetch('https://kk-gpt-zeta.vercel.app/api/quota');
    const quotaData = await quotaRes.json();

    const { allowed, priority, reasons } = rules[room];

    const candidates = priority.filter((model: string) => {
      const q = quotaData[model] || quotaData.models?.[model];
      if (!q) return false;
      return q.limit === 'unlimited' || q.used < q.limit;
    });

    const best = candidates[0] || null;

    res.setHeader('Cache-Control', 'no-store');
    return res.json({
      step: 'success',
      model: best,
      reason: reasons?.[best] || null,
      allCandidates: candidates,
    });
  } catch (err: any) {
    return res.status(500).json({ step: 'catch', message: err.message || 'Unknown error' });
  }
}
