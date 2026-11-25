// Counts Companion downloads, then serves the file as before.
// Only the file name and where the download came from (the website, or the Companion updating itself)
// are counted, one number per day in Supabase. Nothing about the person: no IP address, no cookie,
// nothing in the browser.
const SUPABASE = "https://xdvellqxqjttokqttoss.supabase.co";
const KEY = "sb_publishable_7c7qeppwded9w-zod4ex6Q_5Ds6L5t6"; // public key: it can only call count_download
const ZIP = /^GoldCraftCompanion-\d+\.\d+\.\d+\.zip$/;

export async function onRequest(context) {
  const { request, params, env } = context;
  const response = await env.ASSETS.fetch(request);
  const file = String(params.file || "");
  // a whole download of one of our zips (not a HEAD check, a resumed piece, or a missing file)
  if (request.method === "GET" && response.status === 200 && ZIP.test(file)) {
    const source = (request.headers.get("User-Agent") || "").startsWith("GoldCraftCompanion/") ? "update" : "site";
    context.waitUntil(
      fetch(`${SUPABASE}/rest/v1/rpc/count_download`, {
        method: "POST",
        headers: { apikey: KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ p_file: file, p_source: source }),
      }).catch(() => {}) // counting must never break a download
    );
  }
  return response;
}
