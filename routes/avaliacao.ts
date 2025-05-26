// model Avaliacao {
//   id         String  @id @default(uuid()) @db.VarChar(36)
//   nota       Int
//   comentario String? @db.VarChar(400)
//   feiraId    String
//   feira      Feira   @relation(fields: [feiraId], references: [id])
//   userId     String
//   user       User    @relation(fields: [userId], references: [id])

//   @@map("avaliacoes")
// }

import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();
const router = Router();

// CRUD
// Read
router.get("/", async (req, res) => {
  const avaliacoes = await prisma.avaliacao.findMany({
    include: {
      feira: {
        select: {
          id: true,
          nome: true,
        },
      },
      user: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
  });
  res.status(200).json(avaliacoes);
})

// Get avaliações de uma feira específica
router.get("/feira/:id", async (req, res) => {
  const { id } = req.params;
  const avaliacoes = await prisma.avaliacao.findMany({
    where: { feiraId: id },
    include: {
      user: {
        select: {
          id: true,
          nome: true,
          imagem: true,
        },
      },
    },
  });
  res.status(200).json(avaliacoes);
})

// Get avaliações de um usuário específico
router.get("/usuario/:id", async (req, res) => {
  const { id } = req.params;
  const avaliacoes = await prisma.avaliacao.findMany({
    where: { userId: id },
    include: {
      feira: {
        select: {
          id: true,
          nome: true,
        },
      },
      user: {
        select: {
          id: true,
          nome: true,
          imagem: true,
        },
      },
    },
  });
  res.status(200).json(avaliacoes);
})

// Create
router.post("/", async (req, res) => {
  const { nota, comentario, feiraId, userId } = req.body;
  if (!feiraId || !userId) {
    return res.status(400).json({ error: "feiraId e/ou userId são obrigatórios" });
  } else if (!nota) {
    return res.status(400).json({ error: "Nota é obrigatória" });
  } else {
    const avaliacao = await prisma.avaliacao.create({
      data: { nota, comentario, feiraId, userId },
    });

    // Gera uma nova média de avaliações para a feira
    const { _avg } = await prisma.avaliacao.aggregate({
      where: { feiraId },
      _avg: { nota: true },
    });

    // Atualiza a média de avaliações da feira
    await prisma.feira.update({
      where: { id: feiraId },
      data: { avaliacao: _avg.nota },
    });

    res.status(201).json(avaliacao);
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const avaliacao = await prisma.avaliacao.delete({
    where: { id: id },
  });

  // Gera uma nova média de avaliações para a feira
  const { _avg } = await prisma.avaliacao.aggregate({
    where: { feiraId: avaliacao.feiraId },
    _avg: { nota: true },
  });

  // Atualiza a média de avaliações da feira
  await prisma.feira.update({
    where: { id: avaliacao.feiraId },
    data: { avaliacao: _avg.nota },
  });
  
  res.status(200).json(avaliacao);
});

export default router;