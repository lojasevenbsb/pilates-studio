import { withDB }    from "@/src/lib/withDB.js";
import { Instrutor } from "@/src/lib/models/Instrutor.js";

export const GET = withDB(async (_req, { params }) => {
  const { id } = await params;
  const doc = await Instrutor.findById(id).populate("modalidades");
  if (!doc) return Response.json({ error: "Não encontrado" }, { status: 404 });
  return Response.json({ data: doc });
});

export const PUT = withDB(async (req, { params }) => {
  const { id } = await params;
  const body   = await req.json();
  const doc    = await Instrutor.findByIdAndUpdate(id, body, { new: true, runValidators: true }).populate("modalidades");
  if (!doc) return Response.json({ error: "Não encontrado" }, { status: 404 });
  return Response.json({ data: doc });
});

export const DELETE = withDB(async (_req, { params }) => {
  const { id } = await params;
  const doc    = await Instrutor.findByIdAndDelete(id);
  if (!doc) return Response.json({ error: "Não encontrado" }, { status: 404 });
  return Response.json({ data: { success: true } });
});
