import { withDB }      from "@/src/lib/withDB.js";
import { Modalidade }  from "@/src/lib/models/Modalidade.js";

export const GET = withDB(async () => {
  const data = await Modalidade.find().sort({ nome: 1 });
  return Response.json({ data });
});

export const POST = withDB(async (req) => {
  const body = await req.json();
  const doc  = await Modalidade.create(body);
  return Response.json({ data: doc }, { status: 201 });
});
