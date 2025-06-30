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
}