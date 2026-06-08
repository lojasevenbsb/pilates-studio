import { withDB }      from "@/src/lib/withDB.js";
import { Agendamento } from "@/src/lib/models/Agendamento.js";

export const GET = withDB(async (_req, { params }) => {
  const { id } = await params;
  const doc = await Agendamento.findById(id);
  if (!doc) return Response.json({ error: "Não encontrado" }, { status: 404 });
  return Response.json({ data: doc });
});

export const PUT = withDB(async (req, { params }) => {
  const { id } = await params;
  const body   = await req.json();
  delete body._id;
  const doc = await Agendamento.findByIdAndUpdate(id, body, { new: true, runValidators: true });
  if (!doc) return Response.json({ error: "Não encontrado" }, { status: 404 });
  return Response.json({ data: doc });
});

export const DELETE = withDB(async (_req, { params }) => {
  const { id } = await params;
  const doc    = await Agendamento.findByIdAndDelete(id);
  if (!doc) return Response.json({ error: "Não encontrado" }, { status: 404 });
  return Response.json({ data: { success: true } });
});
