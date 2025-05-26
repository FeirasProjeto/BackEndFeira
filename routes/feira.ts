import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();
const router = Router();

async function main() {
  //SOFT DELETE MIDDLEWARE 
  prisma.$use(async (params, next) => {
    // Check incoming query type
    if (params.model == "Feira") {
      if (params.action == "delete") {
        // Delete queries
        // Change action to an update
        params.action = "update";
        params.args["data"] = { deleted: true };
      }
    }
    return next(params);
  });
}
main();

// CRUD
// Read
router.get("/", async (req, res) => {
  const feiras = await prisma.feira.findMany(
    {
      include: {
        _count: {
          select: {
            favoritos: true,
            Avaliacoes: true
          }
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                nome: true
              }
            }
          }
        },
        diaSemana: {
          select: {
            diaSemana: true
          }
        },
        Avaliacoes: {
          select: {
            id: true,
            nota: true,
            comentario: true,
            user: {
              select: {
                id: true,
                nome: true,
                imagem: true
              }
            }
          }
        }
      }
    }
  );
  res.status(200).json(feiras);
});

// Get feira especifica
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const feira = await prisma.feira.findUnique({
    where: { id: id },
  });
  res.status(200).json(feira);
});

// filtros
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const feira = await prisma.feira.findUnique({
    where: { id: id },
  });
  res.status(200).json(feira);
});

// Create
router.post("/", async (req, res) => {
  const { nome, endereco, numero, cidade, coordenada, horario, data, descricao, imagem, tags, diaSemana, userId } = req.body;

  if (!nome || !endereco || !numero || !cidade || !coordenada || !horario || !imagem || !userId) {
    return res.status(400).json({ message: "Todos os campos devem ser preenchidos" });
  }

  const feira = await prisma.feira.create({
    data: { nome, endereco, numero, cidade, coordenada, horario, descricao, imagem, userId },
  });

  for (const tag of tags) {
    const feiraTag = await prisma.feiraTag.create({
      data: {
        feiraId: feira.id,
        tagId: tag.id,
      },
    });
  }

  if (diaSemana.length > 0) {

    for (const dia of diaSemana) {
      const diaSemanaFeira = await prisma.diaSemanaFeira.create({
        data: {
          diaSemanaId: dia.id,
          feiraId: feira.id,
        },
      });
    }
    res.status(201).json(feira);
  } else {
    const feiraDia = await prisma.feira.update({
      where: { id: feira.id },
      data: { data: new Date(data) },
    });
    res.status(201).json(feiraDia);
  }

});

// Update
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, endereco, numero, cidade, coordenada, horario, descricao, imagem } = req.body;

  const feira = await prisma.feira.update({
    where: { id: id },
    data: { nome, endereco, numero, cidade, coordenada, horario, descricao, imagem },
  });
  res.status(200).json(feira);
});

// Delete
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const feira = await prisma.feira.delete({
    where: { id: id },
  });
  res.status(200).json(feira);
});

export default router;
