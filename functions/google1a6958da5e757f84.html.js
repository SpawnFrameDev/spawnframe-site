// Google Search Console ownership check. Served from a function because Cloudflare Pages redirects
// static *.html addresses to their extensionless form, and the check needs this exact address.
export function onRequest() {
  return new Response("google-site-verification: google1a6958da5e757f84.html", {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
