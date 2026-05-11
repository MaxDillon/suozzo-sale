import { Hono } from "hono";
import { type KVNamespace } from "@cloudflare/workers-types";

type Env = {
    VOTES: KVNamespace;
};

const app = new Hono<{ Bindings: Env }>();

app.post("/api/vote", async (c) => {
    const body = await c.req.json();

    await c.env.VOTES.put(crypto.randomUUID(), JSON.stringify(body));

    return c.json({ ok: true });
});

app.get("/api/hello", async (c) => {
    return c.json({
        response: "hello",
    });
});

export default app;
