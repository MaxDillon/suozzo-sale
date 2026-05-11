export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // CORS (needed for browser calls)
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        // POST /vote
        if (url.pathname === "/vote" && request.method === "POST") {
            const body = await request.json();

            const vote = {
                userId: body.userId,
                itemId: body.itemId,
                value: body.value, // "like" | "pass"
                ts: Date.now(),
            };

            // simple append-only log key
            const key = "votes_log";

            const existing = (await env.VOTES.get(key)) || "[]";
            const arr = JSON.parse(existing);

            arr.push(vote);

            await env.VOTES.put(key, JSON.stringify(arr));

            return new Response(JSON.stringify({ ok: true }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response("Not found", { status: 404, headers: corsHeaders });
    },
};
