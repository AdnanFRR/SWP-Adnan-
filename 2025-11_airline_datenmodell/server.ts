import { Application, Router, Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { prisma } from "./repository/db.ts";

const router = new Router();

// GET /flights - alle Flüge
router.get("/flights", async (ctx: Context) => {
  try {
    const flights = await prisma.flight.findMany();
    ctx.response.status = 200;
    ctx.response.body = flights;
  } catch (e) {
    ctx.response.status = 500;
    ctx.response.body = { error: (e as Error).message };
  }
});

// GET /flights/:id - ein Flug per ID
router.get("/flights/:id", async (ctx: Context) => {
  try {
    const id = ctx.params.id;
    const flight = await prisma.flight.findUnique({ where: { id } });
    if (!flight) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Flight not found" };
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = flight;
  } catch (e) {
    ctx.response.status = 500;
    ctx.response.body = { error: (e as Error).message };
  }
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server läuft auf http://localhost:8000");
await app.listen({ port: 8000 });
