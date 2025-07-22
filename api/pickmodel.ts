import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  const room = req.query.room;
  if (!room) return res.status(400).json({ error: 'Missing ?room=' });

  // อ่าน YAML จาก api/ (เพราะ vercel bundle ไฟล์ในโฟลเดอร์นี้)
  const filePath = path.resolve(__dirname, 'rules_v1.yml');
  const rules = yaml.load(fs.readFileSync(filePath, 'utf8')) as any;

  if (!rules[room]) {
    return res.status(400).json({ error: `Unknown room "${room}"` });
  }

  // ดึง quota สด
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
  res.json({ model: best, reason: reasons[best] || null });
}
