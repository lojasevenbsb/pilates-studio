import { connectDB } from "./mongodb.js";

export function withDB(handler) {
  return async (request, context) => {
    try {
      await connectDB();
      return await handler(request, context);
    } catch (e) {
      if (e.name === "ValidationError") {
        const msg = Object.values(e.errors).map(v => v.message).join("; ");
        return Response.json({ error: msg }, { status: 422 });
      }
      if (e.name === "CastError") {
        return Response.json({ error: "ID inválido" }, { status: 400 });
      }
      if (e.code === 11000) {
        return Response.json({ error: "Registro duplicado" }, { status: 409 });
      }
      console.error("[API Error]", e);
      return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
  };
}
