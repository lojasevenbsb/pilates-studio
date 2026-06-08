import { withDB }  from "@/src/lib/withDB.js";
import { Plano }   from "@/src/lib/models/Plano.js";

// GET /api/planos — lista todos os planos ativos
export const GET = withDB(async () => {
  const planos = await Plano.find({ ativo: true }).sort({ freq: 1, meses: 1 }).lean();
  // Expõe "id" como slug para compatibilidade com o frontend
  const data = planos.map(p => ({ ...p, id: p.slug, _id: p._id.toString() }));
  return Response.json({ data });
});
