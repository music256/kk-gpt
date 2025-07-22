const axios = require("axios");

module.exports = async function fetchQuotaJson() {
  const rawUrl = "https://raw.githubusercontent.com/music256/kk-gpt/main/Quota.txt";
  const startTag = "<!--QUOTA_JSON_START-->";
  const endTag = "<!--QUOTA_JSON_END-->";

  try {
    const { data } = await axios.get(rawUrl, { timeout: 5000 });
    const jsonSection = data.split(startTag)[1]?.split(endTag)[0]?.trim();
    if (!jsonSection) throw new Error("Quota JSON not found in file.");
    return JSON.parse(jsonSection);
  } catch (err) {
    console.error("Failed to fetch quota.json:", err.message);
    return null;
  }
};
