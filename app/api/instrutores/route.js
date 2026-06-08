import { withDB }    from "@/src/lib/withDB.js";
import { Instrutor } from "@/src/lib/models/Instrutor.js";

export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const filtro = {};
  if (searchParams.get("status")) filtro.status = searchParams.get("status");
  const data = await Instrutor.find(filtro).sort({ nome: 1 }).populate("modalidades");
  return Response.json({ data });
});

export const POST = withDB(async (req) => {
  const body = await req.json();
  const doc  = await Instrutor.create(body);
  await doc.populate("modalidades");
  return Response.json({ data: doc }, { status: 201 });
});
