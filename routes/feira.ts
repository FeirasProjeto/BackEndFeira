import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import multer from "multer"

const prisma = new PrismaClient();
const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

const feiraSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  coordenada: z.string().min(1, "Coordenada é obrigatória"),
  horarioInicio: z.string().min(1, "Horário de início é obrigatório"),
  horarioFim: z.string().min(1, "Horário de fim é obrigatório"),
  descricao: z.string().optional(),
  imagem: z.string().optional(),
  tags: z
    .array(
      z.object({
        id: z.string().uuid(),
      })
    )
    .optional(),
  diaSemana: z
    .array(
      z.object({
        nome: z.string().min(1, "Dia da semana é obrigatório"),
      })
    )
    .optional(),
  Avaliacoes: z
    .array(
      z.object({
        id: z.string().uuid(),
        nota: z
          .number()
          .min(1, "Nota deve ser maior ou igual a 1")
          .max(5, "Nota deve ser menor ou igual a 5"),
        comentario: z.string().optional(),
        user: z
          .object({
            id: z.string().uuid(),
            nome: z.string().min(1, "Nome do usuário é obrigatório"),
            imagem: z.string().optional(),
          })
          .optional(),
      })
    )
    .optional(),
  userId: z.string().uuid().min(1, "ID do usuário é obrigatório"),
  categoria: z.object({
    id: z.string().uuid(),
    nome: z.string().min(1, "Nome da categoria é obrigatório"),
    cor: z.string().min(1, "Cor da categoria é obrigatória"),
  }),
  favoritos: z.array(
    z.object({
      id: z.string().uuid(),
      user: z
        .object({
          id: z.string().uuid(),
          nome: z.string().min(1, "Nome do usuário é obrigatório"),
          imagem: z.string().optional(),
        })
        .optional(),
    })
  ),

});

// CRUD
// Read
router.get("/", async (req, res) => {
  const { userId } = req.query;

  const feiras = await prisma.feira.findMany({
    where: { deleted: false },
    include: {
      _count: {
        select: {
          favoritos: true,
          Avaliacoes: true,
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      },
      diaSemana: {
        select: {
          diaSemana: true,
        },
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
              imagem: true,
            },
          },
        },
      },
      categoria: {
        select: {
          categoria: {
            select: {
              id: true,
              nome: true,
              cor: true,
            },
          },
        },
      }
    },
  });

  const feirasFavoritas = await prisma.feira.findMany({
    where: {
      favoritos: {
        some: {
          userId: userId as string,
        },
      },
      deleted: false,
    },
    include: {
      _count: {
        select: {
          favoritos: true,
          Avaliacoes: true,
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      },
      diaSemana: {
        select: {
          diaSemana: true,
        },
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
              imagem: true,
            },
          },
        },
      },
      categoria: {
        select: {
          categoria: {
            select: {
              id: true,
              nome: true,
              cor: true,
            },
          },
        },
      }
    },
  });

  res.status(200).json({ quantidade: feiras.length, feiras, feirasFavoritas });
});

// filtros
router.get("/filtros", async (req, res) => {
  const { tags, diaSemana, horario, pesquisa } = req.query;

  const filters: any = {
    deleted: false,
    nome: {
      contains: pesquisa as string,
      mode: "insensitive",
    },
  };
  if (tags) {
    const tagNomes = (tags as string).split(",");

    const tagIds = await prisma.tag.findMany({
      where: {
        nome: {
          in: tagNomes,
        },
      },
      select: { id: true },
    });

    const ids = tagIds.map((tag) => tag.id);

    filters.tags = {
      some: {
        tagId: {
          in: ids,
        },
      },
    };
  }

  if (diaSemana) {
    const nomesDias = (diaSemana as string).split(",");

    const dias = await prisma.diaSemana.findMany({
      where: {
        nome: {
          in: nomesDias,
        },
      },
      select: { id: true },
    });

    const ids = dias.map((dia) => dia.id);

    filters.diaSemana = {
      some: {
        diaSemanaId: {
          in: ids,
        },
      },
    };
  }

  if (horario) {
    filters.horario = {
      contains: horario as string,
      mode: "insensitive",
    };
  }

  const feiras = await prisma.feira.findMany({
    where: filters,
    include: {
      _count: {
        select: {
          favoritos: true,
          Avaliacoes: true,
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      },
      diaSemana: {
        select: {
          diaSemana: true,
        },
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
              imagem: true,
            },
          },
        },
      },
      categoria: {
        select: {
          categoria: {
            select: {
              id: true,
              nome: true,
              cor: true,
            },
          },
        },
      }
    },
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
    include: {
      _count: {
        select: {
          favoritos: true,
          Avaliacoes: true,
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      },
      diaSemana: {
        select: {
          diaSemana: true,
        },
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
              imagem: true,
            },
          },
        },
      },
      categoria: {
        select: {
          categoria: {
            select: {
              id: true,
              nome: true,
              cor: true,
            },
          },
        },
      }
    }
  });
  res.status(200).json(feiras);
});

// get feiras favoritadas pelo usuário
router.get("/favoritas/:userId", async (req, res) => {
  const { userId } = req.params;

  const feiras = await prisma.feira.findMany({
    where: {
      favoritos: {
        some: {
          userId: userId,
        },
      },
      deleted: false,
    },
    include: {
      _count: {
        select: {
          favoritos: true,
          Avaliacoes: true,
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      },
      diaSemana: {
        select: {
          diaSemana: true,
        },
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
              imagem: true,
            },
          },
        },
      },
      categoria: {
        select: {
          categoria: {
            select: {
              id: true,
              nome: true,
              cor: true,
            },
          },
        },
      }
    },
  });

  res.status(200).json(feiras);
});

// Get feira especifica
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const feira = await prisma.feira.findUnique({
    where: { id: id, deleted: false },
    include: {
      _count: {
        select: {
          favoritos: true,
          Avaliacoes: true,
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      },
      diaSemana: {
        select: {
          diaSemana: true,
        },
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
              imagem: true,
            },
          },
        },
      },
      categoria: {
        select: {
          categoria: {
            select: {
              id: true,
              nome: true,
              cor: true,
            },
          },
        },
      }
    },
  });
  res.status(200).json(feira);
});

// Create
router.post("/", upload.single("imagem"), async (req, res) => {
  const {
    nome,
    endereco,
    numero,
    cidade,
    coordenada,
    horarioInicio,
    horarioFim,
    data,
    descricao,
    userId,
    categoria,
  } = req.body;


  const imagem = req.file?.buffer.toString("base64") || null;

  const tags = JSON.parse(req.body.tags) || [];
  const diaSemana = JSON.parse(req.body.diaSemana) || [];

  if (
    !nome ||
    !endereco ||
    !numero ||
    !cidade ||
    !coordenada ||
    !horarioInicio ||
    !horarioFim ||
    !userId ||
    !categoria
  ) {
    return res
      .status(400)
      .json({
        message: "Todos os campos devem ser preenchidos",
        campoFaltante: !nome
          ? "nome"
          : !endereco
            ? "endereco"
            : !numero
              ? "numero"
              : !cidade
                ? "cidade"
                : !coordenada
                  ? "coordenada"
                  : !horarioInicio
                    ? "horarioInicio"
                    : !horarioFim
                      ? "horarioFim"
                      : !userId
                        ? "userId"
                        : "",
        categoria: !categoria ? "categoria" : "",
      });
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
    data: {
      nome,
      endereco,
      numero,
      cidade,
      coordenada,
      horarioInicio,
      horarioFim,
      descricao,
      imagem,
      userId,
      turno,
    },
  });

  if (tags && tags.length > 0) {
    console.log(`Adicionando tags para a feira ${feira.id}:`, tags);
    
    for (const tag of tags) {
      console.log(`Verificando se a tag ${tag} existe...`);
      
      const tagExists = await prisma.tag.findFirst({
        where: { nome: tag },
      });

      if (!tagExists) {
        const deletaFeira = await prisma.feira.delete({
          where: { id: feira.id },
        })
        return res.status(404).json({ message: `Tag com ID ${tag} não encontrada` });
      }

      const feiraTag = await prisma.feiraTag.create({
        data: {
          feiraId: feira.id,
          tagId: tagExists.id,
        },
      });
    }
  }

  const categorias = await prisma.categoria.findFirst({
    where: { id: Number(categoria) },
  });

  if (!categorias) {
    const deletaFeira = await prisma.feira.delete({
      where: { id: feira.id },
    });
    return res.status(404).json({ message: "Categoria não encontrada" });
  } else {
    const categoriaFeira = await prisma.categoriaFeira.create({
      data: {
        feiraId: feira.id,
        categoriaId: categorias.id,
      },
    });
  }

  if (diaSemana && diaSemana.length > 0) {
    for (const dia of diaSemana) {
      const diaSemana = await prisma.diaSemana.findFirst({
        where: { nome: dia },
      });
      if (!diaSemana) {
        const deletaFeira = await prisma.feira.delete({
          where: { id: feira.id },
        });
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
// Deleta feiras expiradas
// Rota já está automatizada para rodar diariamente à meia-noite
// Mas pode ser chamada manualmente se necessário
router.patch("/deletar-expiradas", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day

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

    res.status(200).json({
      message: `${result.count} feiras marcadas como excluídas`,
      count: result.count,
      data: result
    });
  } catch (error) {
    console.error("Erro ao excluir feiras expiradas:", error);
    res.status(500).json({ message: "Erro ao processar a solicitação" });
  }
});

// Atualiza feira
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nome,
    endereco,
    numero,
    cidade,
    coordenada,
    diaSemana,
    tags,
    horarioInicio,
    horarioFim,
    descricao,
    imagem,
    turno,
    categoria
  } = req.body;

  console.log(`Atualizando feira com ID: ${id}`);

  const feira = await prisma.feira.update({
    where: { id: id },
    data: {
      nome,
      endereco,
      numero,
      cidade,
      coordenada,
      horarioInicio,
      horarioFim,
      descricao,
      imagem,
      turno,
    },
  });

  if (tags && tags.length > 0) {
    // Remove tags antigas
    await prisma.feiraTag.deleteMany({
      where: { feiraId: id },
    });

    // Adiciona novas tags
    for (const tag of tags) {
      await prisma.feiraTag.create({
        data: {
          feiraId: id,
          tagId: tag.id,
        },
      });
    }
  }

  if (diaSemana && diaSemana.length > 0) {
    // Remove dias antigos
    await prisma.diaSemanaFeira.deleteMany({
      where: { feiraId: id },
    });

    // Adiciona novos dias
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
          feiraId: id,
        }
      });
    }
  }

  if (categoria) {
    console.log(`Atualizando categoria para a feira ${id} com categoria ${categoria.id}`);

    const categoriaFeira = await prisma.categoriaFeira.findFirst({
      where: { feiraId: id },
    });

    if (categoriaFeira) {
      console.log(`Categoria feira encontrada: ${categoriaFeira.categoriaId}`);
      await prisma.categoriaFeira.update({
        where: { categoriaId_feiraId: { categoriaId: categoriaFeira.categoriaId, feiraId: categoriaFeira.feiraId } },
        data: { categoriaId: categoria },
      });
    } else {
      console.log(`Categoria feira não encontrada, criando nova associação`);
      await prisma.categoriaFeira.create({
        data: {
          feiraId: id,
          categoriaId: categoria,
        },
      });
    }
  }
  res.status(200).json(feira);
});

//Delete todas as feiras
router.delete("/deletar-todas", async (req, res) => {
  const feiras = await prisma.feira.deleteMany(
    {
      where: { deleted: true }
    }
  );

  if (feiras.count === 0) {
    return res.status(404).json({ message: "Nenhuma feira encontrada" });
  }
  if (feiras.count > 0) {
    return res.status(200).json({ message: "Todas as feiras deletadas com sucesso!", count: feiras.count, data: feiras });
  }
  if (feiras.count < 0) {
    return res.status(400).json({ message: "Erro ao deletar feiras" });
  }
  if (feiras.count === undefined) {
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
  if (feiras.count === null) {
    return res.status(504).json({ message: "Tempo limite de solicitação excedido" });
  }
});

// Delete feira específica permanentemente
router.delete("/:id/permanente", async (req, res) => {
  const { id } = req.params;

  const feira = await prisma.feira.delete({
    where: { id: id },
  });
  res.status(200).json(feira);
});

// Delete feira específica
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const feira = await prisma.feira.update({
    where: { id: id },
    data: { deleted: true }
  });
  res.status(200).json(feira);
});

export default router;