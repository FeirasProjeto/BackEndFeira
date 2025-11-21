import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod"; // Adição do Zod

const prisma = new PrismaClient();
const router = Router();

// Schema de validação com Zod para o parâmetro ID
const idSchema = z.object({
  id: z.string().uuid() // Valida que o ID é um UUID válido
});

// CRUD 
// Read
router.get("/", async (req, res) => {
  const diaSemanas = await prisma.diaSemana.findMany();
  res.status(200).json(diaSemanas);
});

router.get("/:id", async (req, res) => {
  try {
    // Valida o parâmetro ID com Zod
    const { id } = idSchema.parse(req.params);

    const diaSemana = await prisma.diaSemana.findUnique({
      where: { id: id }
    });
    
    res.status(200).json(diaSemana);
  } catch (error) {
    // Retorna erro de validação caso o ID não seja válido
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "ID inválido",
        details: error.errors 
      });
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Create
router.post("/", async (req, res) => {
  const { nome } = req.body;
  const diaSemana = await prisma.diaSemana.create({
    data: {
      nome: nome
    }
  });
  res.status(201).json(diaSemana);
});

export default router;