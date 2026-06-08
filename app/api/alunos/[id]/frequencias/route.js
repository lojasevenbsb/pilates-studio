import { withDB } from "@/src/lib/withDB.js";
import { Aluno }  from "@/src/lib/models/Aluno.js";

const todayStr = () => new Date().toISOString().split("T")[0];

// POST /api/alunos/[id]/frequencias
// Body: { presente: boolean, data?: "YYYY-MM-DD" }
export const POST = withDB(async (req, { params }) => {
  const { id }   = await params;
  const body     = await req.json();
  const data     = body.data || todayStr();
  const presente = Boolean(body.presente);

  const aluno = await Aluno.findById(id);
  if (!aluno) return Response.json({ error: "Aluno não encontrado" }, { status: 404 });

  const idx = aluno.frequencias.findIndex(f => f.data === data);
  if (idx >= 0) {
    aluno.frequencias[idx].presente = presente;
  } else {
    aluno.frequencias.push({ data, presente });
  }

  await aluno.save();
  return Response.json({ data: aluno });
});
