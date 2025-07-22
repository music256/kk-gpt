// /api/pickModel.js

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export default async function handler(req, res) {
  const room = req.query.room;
  if (!room) return res.status(400).json({ error: 'Missing ?room=' });

  // โหลด YAML จาก root repo
  const filePath = path.resolve(process.cwd(), 'rules_v1.yml');
  const rules = yaml.load(fs.readFileSync(filePath, 'utf8'));

  if (!rules[room]) {
    return res.status(400).json({ error: `Unknown room "${room}"` });
  }

  // ดึง quota สด
  const quotaRes = await fetch('https://kk-gpt-zeta.vercel.app/api/quota');
  const quotaData = await quotaRes.json();

  const { allowed, priority, reasons } = rules[room];

  // ตัดโมเดลที่ quota เต็ม
  const candidates = priority.filter(model => {
    const q = quotaData[model] || quotaData.models?.[model];
    if (!q) return false;
    return q.limit === 'unlimited' || q.used < q.limit;
  });

  const best = candidates[0] || null;

  res.setHeader('Cache-Control', 'no-store');
  res.json({ model: best, reason: reasons[best] || null });
}
