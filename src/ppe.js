export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { action, payload } = req.body || {};

  if (!action) {
    res.status(400).json({ success: false, error: 'Missing action' });
    return;
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL; // new env var on Vercel

  try {
    const gsRes = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload }),
    });

    const data = await gsRes.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
}
