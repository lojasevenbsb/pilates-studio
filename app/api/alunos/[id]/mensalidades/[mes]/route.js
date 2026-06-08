import { withDB } from "@/src/lib/withDB.js";
import { Aluno }  from "@/src/lib/models/Aluno.js";

const todayStr = () => new Date().toISOString().split("T")[0];

// PATCH /api/alunos/[id]/mensalidades/[mes]
// Body: { formaPag: "Pix" } — marca como pago
// Body: { pago: false }    — desmarca
export const PATCH = withDB(async (req, { params }) => {
  const { id, mes } = await params;
  const body        = await req.json();

  const aluno = await Aluno.findById(id);
  if (!aluno) return Response.json({ error: "Aluno não encontrado" }, { status: 404 });

  const m = aluno.mensalidades.find(m => m.mes === mes);
  if (!m) return Response.json({ error: "Mensalidade não encontrada" }, { status: 404 });

  if (body.pago === false) {
    m.pago    = false;
    m.dataPag = null;
    m.formaPag= null;
  } else {
    m.pago    = true;
    m.dataPag = todayStr();
    m.formaPag= body.formaPag || null;
  }

  await aluno.save();
  return Response.json({ data: aluno });
});
