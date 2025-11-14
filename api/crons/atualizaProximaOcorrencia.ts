import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js"
import timezone  from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
  try {
    const agora = dayjs().tz("America/Sao_Paulo");

    const feirasSemanais = await prisma.feira.findMany({
      where: {
        deleted: false,
        data: null,
      },
      include: {
        diaSemana: {
          select: {
            diaSemana: { select: { nome: true } },
          },
        },
      },
    });

    const diasMap: Record<string, number> = {
      "Domingo": 0,
      "Segunda-feira": 1,
      "Terça-feira": 2,
      "Quarta-feira": 3,
      "Quinta-feira": 4,
      "Sexta-feira": 5,
      "Sábado": 6,
    };

    const horaAgora = agora.format("HH:mm");
    const hojeNum = agora.day();

    for (const feira of feirasSemanais) {
      if (!feira.diaSemana?.length) continue;

      const dias = feira.diaSemana.map((d) => d.diaSemana.nome);

      const diffs = dias.map((nome) => {
        const dia = diasMap[nome];
        let diff = (dia - hojeNum + 7) % 7;

        const horaFim = feira.horarioFim ?? "00:00";

        if (diff === 0 && horaAgora < horaFim) diff = 0;
        if (diff === 0 && horaAgora >= horaFim) diff = 7;

        return diff;
      });

      const menor = Math.min(...diffs);

      const proximaData = agora.add(menor, "day").startOf("day").toDate();

      await prisma.feira.update({
        where: { id: feira.id },
        data: { proximaOcorrencia: proximaData },
      });
    }

    return res.status(200).json({
      updated: feirasSemanais.length,
      runAt: agora.toISOString(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Cron job failed" });
  }
}
