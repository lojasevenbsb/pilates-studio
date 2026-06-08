import { withDB }             from "@/src/lib/withDB.js";
import { Aluno }              from "@/src/lib/models/Aluno.js";
import { Agendamento }        from "@/src/lib/models/Agendamento.js";
import { Plano }              from "@/src/lib/models/Plano.js";
import { gerarMensalidades }  from "@/src/lib/gerarMensalidades.js";
import { gerarAgendamentos }  from "@/src/lib/gerarAgendamentos.js";

// GET /api/alunos?q=nome&ativo=true
export const GET = withDB(async (req) => {
  const { searchParams } = new URL(req.url);
  const q     = searchParams.get("q");
  const ativo = searchParams.get("ativo");

  const filtro = {};
  if (ativo !== null) filtro.ativo = ativo !== "false";
  if (q) filtro.nome = { $regex: q, $options: "i" };

  const data = await Aluno.find(filtro).sort({ nome: 1 });
  return Response.json({ data });
});

// POST /api/alunos
export const POST = withDB(async (req) => {
  const body = await req.json();

  const plano        = await Plano.findOne({ slug: body.planoId }).lean();
  const mensalidades = gerarMensalidades(body, plano);

  const aluno = await Aluno.create({
    ...body,
    ativo:        true,
    mensalidades,
    frequencias:  body.frequencias  || [],
  });

  // Gera agendamentos recorrentes se o contrato tiver datas e dias definidos
  const agsParaCriar = gerarAgendamentos(aluno);
  let qtdAulas = 0;
  if (agsParaCriar.length) {
    await Agendamento.insertMany(agsParaCriar);
    qtdAulas = agsParaCriar.length;
  }

  return Response.json({ data: aluno, qtdAulas }, { status: 201 });
});
