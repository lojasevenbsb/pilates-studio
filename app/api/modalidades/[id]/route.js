import { withDB }     from "@/src/lib/withDB.js";
import { Modalidade } from "@/src/lib/models/Modalidade.js";

export const GET = withDB(async (_req, { params }) => {
  const { id } = await params;
  const doc = await Modalidade.findById(id);
  if (!doc) return Response.json({ error: "Não encontrado" }, { status: 404 });
  return Response.json({ data: doc });
});

export const PUT = withDB(async (req, { params }) => {
  const { id }  = await params;
  const body    = await req.json();
  const doc     = await Modalidade.findByIdAndUpdate(id, body, { new: true, runValidators: true });
  if (!doc) return Response.json({ error: "Não encontrado" }, { status: 404 });
  return Response.json({ data: doc });
});

export const DELETE = withDB(async (_req, { params }) => {
  const { id } = await params;
  const doc    = await Modalidade.findByIdAndDelete(id);
  if (!doc) return Response.json({ error: "Não encontrado" }, { status: 404 });
  return Response.json({ data: { success: true } });
});
