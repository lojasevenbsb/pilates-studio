import { withDB }      from "@/src/lib/withDB.js";
import { Agendamento } from "@/src/lib/models/Agendamento.js";

// GET /api/agendamentos?data=2026-06-08
//                      ?dataInicio=2026-06-01&dataFim=2026-06-30
//                      ?alunoId=xxx
export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const filtro = {};

  const data      = searchParams.get("data");
  const dataInicio= searchParams.get("dataInicio");
  const dataFim   = searchParams.get("dataFim");
  const alunoId   = searchParams.get("alunoId");

  if (data)                      filtro.data = data;
  else if (dataInicio || dataFim) filtro.data = {
    ...(dataInicio && { $gte: dataInicio }),
    ...(dataFim    && { $lte: dataFim    }),
  };
  if (alunoId) filtro.alunoId = alunoId;

  const docs = await Agendamento.find(filtro).sort({ data: 1, horaInicio: 1 });
  return Response.json({ data: docs });
});

// POST /api/agendamentos
export const POST = withDB(async (req) => {
  const body = await req.json();
  const doc  = await Agendamento.create(body);
  return Response.json({ data: doc }, { status: 201 });
});
