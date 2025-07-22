import yaml from 'js-yaml';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  try {
    const room = req.query.room;
    if (!room) {
      return res.status(400).json({ status: 'missing ?room=' });
    }

    // โหลด YAML
    const rulesRes = await fetch('https://raw.githubusercontent.com/music256/kk-gpt/main/api/rules_v1.yml');
    if (!rulesRes.ok) {
      throw new Error(`Failed to fetch rules: ${rulesRes.status}`);
    }
    const rulesText = await rulesRes.text();
    const rules = yaml.load(rulesText);

    if (!rules[room]) {
      return res.status(400).json({ status: `no such room: ${room}` });
    }

    // โหลด quota
    const quotaRes = await fetch('https://raw.githubusercontent.com/music256/kk-gpt/main/Quota.txt');
    if (!quotaRes.ok) {
      throw new Error(`Failed to fetch quota: ${quotaRes.status}`);
    }
    const quotaData = await quotaRes.json();

    const { allowed, priority, reasons } = rules[room];

    const candidates = priority.filter((model) => {
      const q = quotaData[model] || quotaData[model.trim()];
      if (!q) return false;
      return q.limit === 'unlimited' || q.used < q.limit;
    });

    return res.status(200).json({
      pick: candidates[0] || null,
      allowed,
      priority,
      reasons,
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}
