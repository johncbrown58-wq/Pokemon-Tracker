const PKMNPRICES_BASE = "https://api.pkmnprices.com/v1";
const ALLOWED_ORIGIN = "https://johncbrown58-wq.github.io";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
    "Cache-Control": "no-store"
  };
}

function json(data, status, origin = ALLOWED_ORIGIN) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {"Content-Type": "application/json", ...corsHeaders(origin)}
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (origin && origin !== ALLOWED_ORIGIN) {
      return json({error:{code:"forbidden",message:"Origin not allowed"}}, 403, ALLOWED_ORIGIN);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders(origin),
          "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "Content-Type"
        }
      });
    }

    if (request.method !== "GET") {
      return json({error:{code:"method_not_allowed",message:"GET and OPTIONS only"}}, 405);
    }

    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({status:"ok", pricingConfigured:!!env.PKMNPRICES_API_KEY}, 200);
    }

    if (!env.PKMNPRICES_API_KEY) {
      return json({error:{code:"proxy_not_configured",message:"PkmnPrices API key is not configured on the proxy."}}, 503);
    }

    let upstreamPath = "";
    if (url.pathname === "/cards") {
      upstreamPath = "/cards" + url.search;
    } else {
      const match = url.pathname.match(/^\/cards\/(\d+)$/);
      if (!match) {
        return json({error:{code:"not_found",message:"Unknown pricing endpoint"}}, 404);
      }
      upstreamPath = "/cards/" + match[1] + url.search;
    }

    try {
      const upstream = await fetch(PKMNPRICES_BASE + upstreamPath, {
        method: "GET",
        headers: {
          "X-API-Key": env.PKMNPRICES_API_KEY,
          "Accept": "application/json"
        }
      });

      const body = await upstream.text();
      return new Response(body, {
        status: upstream.status,
        headers: {
          "Content-Type": upstream.headers.get("Content-Type") || "application/json",
          ...corsHeaders(origin)
        }
      });
    } catch {
      return json({error:{code:"upstream_unreachable",message:"Could not reach PkmnPrices."}}, 502);
    }
  }
};
