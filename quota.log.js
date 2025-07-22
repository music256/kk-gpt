const axios = require("axios");

export default async function handler(req, res) {
  try {
    const url = "https://raw.githubusercontent.com/music256/kk-gpt/main/Quota.txt";
    const { data } = await axios.get(url, { timeout: 5000 });
    const logSection = data.split("<!--QUOTA_JSON_END-->")[1];
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(logSection.trim());
  } catch (err) {
    res.status(503).send("Log unavailable.");
  }
}
