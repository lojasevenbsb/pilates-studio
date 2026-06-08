import { withDB } from "@/src/lib/withDB.js";
import { Aluno }  from "@/src/lib/models/Aluno.js";

export const GET = withDB(async (_req, { params }) => {
  const { id } = await params;
  const doc = await Aluno.findById(id);
  if (!doc) return Response.json({ error: "Aluno não encontrado" }, { status: 404 });
  return Response.json({ data: doc });
});

export const PUT = withDB(async (req, { params }) => {
  const { id } = await params;
  const body   = await req.json();

  // Campos que não podem ser sobrescritos via PUT direto
  delete body._id;
  delete body.mensalidades;
  delete body.frequencias;

  const doc = await Aluno.findByIdAndUpdate(id, body, { new: true, runValidators: true });
  if (!doc) return Response.json({ error: "Aluno não encontrado" }, { status: 404 });
  return Response.json({ data: doc });
});

// Soft delete
export const DELETE = withDB(async (_req, { params }) => {
  const { id } = await params;
  const doc = await Aluno.findByIdAndUpdate(id, { ativo: false }, { new: true });
  if (!doc) return Response.json({ error: "Aluno não encontrado" }, { status: 404 });
  return Response.json({ data: { success: true } });
});
