import { Hono } from "hono";
import { type KVNamespace } from "@cloudflare/workers-types";

type Env = {
    VOTES: KVNamespace;
    STARS: KVNamespace;
};

const app = new Hono<{ Bindings: Env }>();

app.post("/api/vote", async (c) => {
    const body = await c.req.json();
    await c.env.VOTES.put(crypto.randomUUID(), JSON.stringify(body));
    return c.json({ ok: true });
});

app.get("/api/hello", async (c) => {
    return c.json({ response: "hello" });
});

app.get("/api/stars", async (c) => {
    const stars: Record<string, string[]> = {};
    const list = await c.env.STARS.list();
    for (const key of list.keys) {
        const val = await c.env.STARS.get(key.name);
        if (val) stars[key.name] = JSON.parse(val);
    }
    return c.json(stars);
});

app.post("/api/stars", async (c) => {
    const body = await c.req.json<{ itemId: string; userId: string }>();
    const existing = await c.env.STARS.get(body.itemId);
    const list: string[] = existing ? JSON.parse(existing) : [];
    const idx = list.indexOf(body.userId);
    if (idx >= 0) {
        list.splice(idx, 1);
    } else {
        list.push(body.userId);
    }
    await c.env.STARS.put(body.itemId, JSON.stringify(list));
    return c.json({ starred: idx < 0, list });
});

export default app;