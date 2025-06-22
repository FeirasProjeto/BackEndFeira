import { PrismaClient } from "@prisma/client";
import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";

const prisma = new PrismaClient();
const router = Router();

// Schemas de validação
const avaliacaoSchema = z.object({
  nota: z.number().min(1).max(5, { message: "A nota deve ser entre 1 e 5" }),
  comentario: z.string().optional(),
  feiraId: z.string().uuid({ message: "ID da feira inválido" }),
  userId: z.string().uuid({ message: "ID do usuário inválido" }),
});

const idParamsSchema = z.object({
  id: z.string().uuid({ message: "ID inválido" }),
});

// Middleware de validação
const validate = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.method === 'GET' ? req.params : req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }
    res.status(500).json({ error: "Erro na validação" });
  }
};

// Helper para atualizar média da feira
const atualizaMediaFeira = async (feiraId: string) => {
  const { _avg } = await prisma.avaliacao.aggregate({
    where: { feiraId },
    _avg: { nota: true },
  });

  return prisma.feira.update({
    where: { id: feiraId },
    data: { avaliacao: _avg.nota },
  });
};

// CRUD
// Read all
router.get("/", async (req, res) => {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      include: {
        feira: { select: { id: true, nome: true } },
        user: { select: { id: true, nome: true } },
      },
    });
    res.status(200).json(avaliacoes);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar avaliações" });
  }
});

// Get avaliações de uma feira
router.get("/feira/:id", validate(idParamsSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { feiraId: id },
      include: {
        user: { select: { id: true, nome: true, imagem: true } },
      },
    });
    res.status(200).json(avaliacoes);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar avaliações da feira" });
  }
});

// Get avaliações de um usuário
router.get("/usuario/:id", validate(idParamsSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { userId: id },
      include: {
        feira: { select: { id: true, nome: true } },
        user: { select: { id: true, nome: true, imagem: true } },
      },
    });
    res.status(200).json(avaliacoes);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar avaliações do usuário" });
  }
});

// Create
router.post("/", validate(avaliacaoSchema), async (req, res) => {
  try {
    const { nota, comentario, feiraId, userId } = req.body;

    const [usuario, feira, avaliacaoExistente] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.feira.findUnique({ where: { id: feiraId } }),
      prisma.avaliacao.findFirst({ where: { feiraId, userId } }),
    ]);

    if (!usuario || !feira) {
      return res.status(404).json({ error: "Usuário ou feira não encontrados" });
    }

    if (avaliacaoExistente) {
      return res.status(400).json({ error: "Usuário já avaliou esta feira" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const avaliacao = await tx.avaliacao.create({
        data: { nota, comentario, feiraId, userId },
      });

      await atualizaMediaFeira(feiraId);
      return avaliacao;
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar avaliação" });
  }
});

// Delete
router.delete("/:id", validate(idParamsSchema), async (req, res) => {
  try {
    const { id } = req.params;

    const avaliacao = await prisma.avaliacao.findUnique({ where: { id } });
    if (!avaliacao) {
      return res.status(404).json({ error: "Avaliação não encontrada" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const deleted = await tx.avaliacao.delete({ where: { id } });
      await atualizaMediaFeira(deleted.feiraId);
      return deleted;
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar avaliação" });
  }
});

export default router;