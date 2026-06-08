import { withDB }       from "@/src/lib/withDB.js";
import { Configuracao } from "@/src/lib/models/Configuracao.js";

export const GET = withDB(async () => {
  const doc = await Configuracao.findById("estudio");
  if (!doc) return Response.json({ error: "Configurações não encontradas" }, { status: 404 });
  return Response.json({ data: doc });
});

export const PUT = withDB(async (req) => {
  const body = await req.json();
  const doc  = await Configuracao.findByIdAndUpdate(
    "estudio",
    { ...body, updatedAt: new Date() },
    { new: true, runValidators: true, upsert: true }
  );
  return Response.json({ data: doc });
});
