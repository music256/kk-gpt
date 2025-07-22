// /api/quota.js

export default async function handler(req, res) {
  try {
    const url = 'https://raw.githubusercontent.com/music256/kk-gpt/main/Quota.txt';
    const response = await fetch(url);
    const text = await response.text();

    const jsonStart = text.indexOf('<!--QUOTA_JSON_START-->');
    const jsonEnd = text.indexOf('<!--QUOTA_JSON_END-->');

    if (jsonStart === -1 || jsonEnd === -1) {
      return res.status(500).json({ error: 'JSON markers not found in Quota.txt' });
    }

    const jsonRaw = text.slice(jsonStart + 24, jsonEnd).trim();
    const data = JSON.parse(jsonRaw);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
