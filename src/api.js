const BASE_URL = import.meta.env.VITE_APPS_SCRIPT_URL;
const PROXY_URL = '/api/ppe'; // Vite proxy path

// fire-and-forget calls (no JSON needed)
async function fireAndForget(action, payload) {
  console.log('Calling Apps Script URL (fire & forget):', BASE_URL, 'action:', action);
  try {
    await fetch(BASE_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload }),
    });
    return { success: true };
  } catch (err) {
    console.error('Error calling Apps Script:', err);
    return { success: false, error: String(err) };
  }
}

// JSON-needed call via proxy
async function callApiWithResponse(action, payload) {
  console.log('Calling Proxy URL (with response):', PROXY_URL, 'action:', action);

  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, payload }),
  });

  const text = await res.text();
  console.log('getRequestItems raw response:', text);

  try {
    return JSON.parse(text);
  } catch (e) {
    return {
      success: false,
      error: 'Server did not return JSON',
      raw: text.slice(0, 200), // first 200 chars for debugging
    };
  }
}

export function createRequest(payload) {
  return fireAndForget('createRequest', payload);
}

export function storemanIssue(payload) {
  return fireAndForget('storemanIssue', payload);
}

export function acknowledgeReceipt(payload) {
  return fireAndForget('acknowledgeReceipt', payload);
}

export function getRequestItems(requestId) {
  return callApiWithResponse('getRequestItems', { requestId });
}
