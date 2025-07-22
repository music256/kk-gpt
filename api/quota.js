// /api/quota.js

export default async function handler(req, res) {
  try {
    const url = 'https://raw.githubusercontent.com/music256/kk-gpt/main/Quota.txt';
    const response = await fetch(url);
    const text = await response.text();

    const jsonStart = text.indexOf('<!--QUOTA_JSON_START-->');
    const jsonEnd = text.indexOf('<!--QUOTA_JSON_END-->');

    if (jsonStart === -1 || jsonEnd === -1) {
      return res.status(500).json({ error: 'Quota JSON section not found' });
    }

    const jsonRaw = text.slice(
      jsonStart + '<!--QUOTA_JSON_START-->'.length,
      jsonEnd
    ).trim();

    const data = JSON.parse(jsonRaw);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch or parse quota', details: error.message });
  }
}
