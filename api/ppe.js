export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  let body;

  // Vercel sometimes doesn’t parse text/plain JSON automatically
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ success: false, error: 'Invalid JSON body' });
  }

  const { action, payload } = body || {};

  if (!action) {
    return res.status(400).json({ success: false, error: 'Missing action' });
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;

  try {
    const gsRes = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload }),
    });

    const text = await gsRes.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        success: false,
        error: 'Apps Script did not return JSON',
        raw: text,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err) });
  }
}
