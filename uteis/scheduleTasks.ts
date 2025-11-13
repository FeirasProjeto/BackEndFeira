import { PrismaClient } from "@prisma/client";
import schedule from "node-schedule";

const prisma = new PrismaClient();

export function setupCleanupTasks() {
  // Roda a limpeza automática de feiras expiradas diariamente à meia-noite
  schedule.scheduleJob("0 0 * * *", async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const result = await prisma.feira.updateMany({
        where: {
          data: {
            lt: today
          },
          deleted: false
        },
        data: {
          deleted: true
        }
      });
      
      console.log(`${result.count} feiras expiradas foram marcadas como excluídas`);
    } catch (error) {
      console.error("Erro na limpeza automática de feiras expiradas:", error);
    }
  });

  schedule.scheduleJob("0 1 * * * *", async () => {
    try {
      const agora = new Date();

      // Busca feiras que não têm data fixa, mas têm dias da semana associados
      const feirasSemanais = await prisma.feira.findMany({
        where: {
          deleted: false,
          data: null, // feiras sem data (semanais)
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

      for (const feira of feirasSemanais) {
        if (!feira.diaSemana?.length) continue;

        const hojeNum = agora.getDay();
        const nomesDias = feira.diaSemana.map(d => d.diaSemana.nome);

        // Calcula em quantos dias ocorrerá a próxima feira
        const diffs = nomesDias.map(nome => {
          const diff = (diasMap[nome] - hojeNum + 7) % 7;
          return diff === 0 ? 7 : diff; // evita 0 → não cai no mesmo dia
        });

        const menorDiff = Math.min(...diffs);
        const proximaData = new Date(agora);
        proximaData.setDate(agora.getDate() + menorDiff);
        proximaData.setHours(0, 0, 0, 0);

        await prisma.feira.update({
          where: { id: feira.id },
          data: { proximaOcorrencia: proximaData },
        });

        console.log(
          `Feira "${feira.nome}" → próxima ocorrência em ${proximaData.toLocaleDateString("pt-BR")}`
        );
      }

      console.log(`Atualização de próximas ocorrências concluída (${feirasSemanais.length} feiras verificadas)`);
    } catch (error) {
      console.error("Erro ao atualizar próximas ocorrências das feiras semanais:", error);
    }
  });
}