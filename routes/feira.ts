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
      where: { deleted: false },
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


// filtros
router.get("/filtros", async (req, res) => {
  const { tags, diaSemana, horario } = req.query;

  const filters: any = {
    deleted: false
  };
  if (tags) {
    const tagNomes = (tags as string).split(",");

    const tagIds = await prisma.tag.findMany({
      where: {
        nome: {
          in: tagNomes
        }
      },
      select: { id: true }
    });

    const ids = tagIds.map(tag => tag.id);

    filters.tags = {
      some: {
        tagId: {
          in: ids
        }
      }
    };
  }

  if (diaSemana) {
    const nomesDias = (diaSemana as string).split(",");

    const dias = await prisma.diaSemana.findMany({
      where: {
        nome: {
          in: nomesDias
        }
      },
      select: { id: true }
    });

    const ids = dias.map(dia => dia.id);

    filters.diaSemana = {
      some: {
        diaSemanaId: {
          in: ids
        }
      }
    };
  }

  if (horario) {
    filters.horario = {
      contains: horario as string,
      mode: "insensitive"
    };
  }

  const feiras = await prisma.feira.findMany({
    where: filters,
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
  });
  if (feiras.length > 0) {
    res.status(200).json(feiras);
  } else {
    res.status(404).json({ message: "Nenhuma feira encontrada" });
  }
});

// Get feiras do usuário
router.get("/usuario/:userId", async (req, res) => {
  const { userId } = req.params;
  const feiras = await prisma.feira.findMany({
    where: { userId: userId, deleted: false },
  });
  res.status(200).json(feiras);
});

// Get feira especifica
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const feira = await prisma.feira.findUnique({
    where: { id: id, deleted: false },
  });
  res.status(200).json(feira);
});

// Create
router.post("/", async (req, res) => {
  const { nome, endereco, numero, cidade, coordenada, horarioInicio, horarioFim, data, descricao, imagem, tags, diaSemana, userId } = req.body;

  if (!nome || !endereco || !numero || !cidade || !coordenada || !horarioInicio || !horarioFim || !userId) {
    return res.status(400).json({ message: "Todos os campos devem ser preenchidos", campoFaltante: !nome ? "nome" : !endereco ? "endereco" : !numero ? "numero" : !cidade ? "cidade" : !coordenada ? "coordenada" : !horarioInicio ? "horarioInicio" : !horarioFim ? "horarioFim" : !userId ? "userId" : "" });
  }

  let turno = "";
  try {
  if (horarioInicio && horarioFim) {

    const [hora] = horarioInicio.split(":").map(Number);
    const [horaFim] = horarioFim.split(":").map(Number);

    if (hora < 12 && horaFim < 12) {
      turno = "Manhã";
    } else if (hora >= 12 && horaFim < 18) {
      turno = "Tarde";
    } else if (hora < 12 && horaFim <= 18) {
      turno = "Manhã e Tarde";
    } else if (hora >= 18 && horaFim >= 18) {
      turno = "Noite";
    } else if (hora >= 12 && horaFim >= 18) {
      turno = "Tarde e Noite";
    } else {
      turno = "Dia inteiro";
    }
  }
} catch (error) {
  return res.status(400).json({ message: "Horário inválido" });
}

  const feira = await prisma.feira.create({
    data: { nome, endereco, numero, cidade, coordenada, horarioInicio, horarioFim, descricao, imagem, userId, turno },
  });

  if (tags.length > 0) {
    for (const tag of tags) {
      const feiraTag = await prisma.feiraTag.create({
        data: {
          feiraId: feira.id,
          tagId: tag.id,
        },
      });
    }
  }

    if (diaSemana.length > 0) {

      for (const dia of diaSemana) {
        const diaSemana = await prisma.diaSemana.findFirst({
          where: { nome: dia },
        });
        if (!diaSemana) {
          return res.status(404).json({ message: `Dia da semana ${dia} não encontrado` });
        }
        const diaSemanaFeira = await prisma.diaSemanaFeira.create({
          data: {
            diaSemanaId: diaSemana.id,
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
  const { nome, endereco, numero, cidade, coordenada, horarioInicio, horarioFim, descricao, imagem, turno } = req.body;

  const feira = await prisma.feira.update({
    where: { id: id },
    data: { nome, endereco, numero, cidade, coordenada, horarioInicio, horarioFim, descricao, imagem, turno },
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
