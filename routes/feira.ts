import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import multer from "multer"
import { put } from "@vercel/blob"

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
  const { tags, diaSemana, turno, pesquisa, categoria, userId } = req.query;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortBy = req.query.sortBy as string || 'proximaOcorrencia';
  const order = req.query.order === 'desc' ? 'desc' : 'asc';

  const skip = (page - 1) * limit;

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
          mode: "insensitive",
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

  if (categoria) {
    const categoriaNome = categoria as string;

    const categoriaId = await prisma.categoria.findFirst({
      where: {
        nome: {
          equals: categoriaNome,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (categoriaId) {
      filters.categoria = {
        some: {
          categoriaId: categoriaId.id,
        },
      };
    } else {
      // Se a categoria não for encontrada, retorna um array vazio
      return res.status(200).json([]);
    }
  }

  if (diaSemana) {
    const nomesDias = (diaSemana as string).split(",");

    const dias = await prisma.diaSemana.findMany({
      where: {
        nome: {
          in: nomesDias,
          mode: "insensitive",
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

  if (turno) {
    filters.turno = {
      contains: turno as string,
      mode: "insensitive",
    };
  }

  const totalFeiras = await prisma.feira.count({ where: filters });
  console.log(`Total de feiras: ${totalFeiras}`);

  const totalPaginas = Math.ceil(totalFeiras / limit);
  console.log(`Total de páginas: ${totalPaginas}`);

  const feiras = await prisma.feira.findMany({
    skip: skip,
    take: limit,
    orderBy: { [sortBy]: order },
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
              categoria: true
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

  let feirasFavoritas: string | any[] = [];

  if (userId) {
    console.log(`Buscando feiras favoritas para userId: ${userId}`);

    const favoritos = await prisma.favorito.findMany({
      where: {
        userId: userId as string,
      },
      select: {
        feiraId: true,
      },
    })
    console.log(`Feiras favoritas pelo usuario: ${favoritos.length}`);

    feirasFavoritas = favoritos.map((favorito) => favorito.feiraId);
  }

  const feirasFavoritadas = feiras.map((feira) => ({
    ...feira,
    favoritado: feirasFavoritas.includes(feira.id)
  }))

  res.status(200).json({ quantidade: feiras.length, pagina: page, totalPaginas, feiras: feirasFavoritadas });
});

// Get feiras do usuário
router.get("/usuario/:userId", async (req, res) => {
  const { userId } = req.params;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortBy = req.query.sortBy as string || 'data';
  const order = req.query.order === 'desc' ? 'desc' : 'asc';

  const skip = (page - 1) * limit;

  console.log(`Buscando feiras do usuário com userId: ${userId}`);
  const feiras = await prisma.feira.findMany({
    skip: skip,
    take: limit,
    orderBy: { [sortBy]: order },
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
              categoria: true
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

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortBy = req.query.sortBy as string || 'data';
  const order = req.query.order === 'desc' ? 'desc' : 'asc';

  const skip = (page - 1) * limit;

  console.log(`Buscando feiras favoritadas pelo usuário com userId: ${userId}`);
  const feiras = await prisma.feira.findMany({
    skip: skip,
    take: limit,
    orderBy: { [sortBy]: order },
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
              categoria: true
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
  const { userId } = req.query;

  console.log(`Buscando feira com ID: ${id}`);
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
              categoria: true
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

  console.log(`Buscando feira favoritada pelo usuario: ${userId}`);
  const feiraFavorita = await prisma.feira.findUnique({
    where: { id: id },
    include: {
      favoritos: {
        where: {
          userId: userId as string,
        },
      },
    },
  })

  let favoritada = false

  if (feiraFavorita && feiraFavorita.favoritos.length > 0 && userId) {
    favoritada = true
  }

  res.status(200).json({ feira, favoritada });
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
    categoria
  } = req.body;

  let { tags, diaSemana } = req.body;

  console.log(`Dados recebidos: ${JSON.stringify(req.body)}`);

  let imagemUrl: string | null = null;

  try {
    if (req.file) {
      const uploaded = await put(
        `feiras/${Date.now()}-${req.file.originalname}`,
        req.file.buffer,
        {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        }
      );
      imagemUrl = uploaded.url;
      console.log("Imagem enviada para o Blob:", imagemUrl);
    }
  } catch (err) {
    console.error("Erro no upload para Blob:", err);
    return res.status(500).json({ message: "Falha ao enviar imagem" });
  }


  if (tags) {
    tags = JSON.parse(tags);
  }
  if (diaSemana) {
    diaSemana = JSON.parse(diaSemana);
  }
  console.log(`Tags recebidas: ${JSON.stringify(tags)}`);
  console.log(`Dias da semana recebidos: ${JSON.stringify(diaSemana)}`);

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
    console.log("Campos obrigatórios não preenchidos");
    return res.status(400).json({
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

  console.log(`Verificando horários: Início - ${horarioInicio}, Fim - ${horarioFim}`);
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
    console.error("Erro ao verificar horários:", error);
    return res.status(400).json({ message: "Horário inválido" });
  }

  console.log(`Turno determinado: ${turno}`);
  console.log("Criando nova feira");

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
      imagem: imagemUrl,
      userId,
      turno,
    },
  });

  console.log(`Feira criada com ID: ${feira.id}`);

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
        console.log(`Tag com nome ${tag} não encontrada, feira ${feira.id} deletada`);
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

  console.log("Adicionando categoria para a feira");

  const categorias = await prisma.categoria.findFirst({
    where: { id: Number(categoria) },
  });

  if (!categorias) {
    const deletaFeira = await prisma.feira.delete({
      where: { id: feira.id },
    });

    console.log(`Feira ${feira.id} deletada devido à categoria não encontrada`);
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

        console.log(`Dia da semana ${dia} não encontrado, feira ${feira.id} deletada`);
        return res.status(404).json({ message: `Dia da semana ${dia} não encontrado` });
      }
      const diaSemanaFeira = await prisma.diaSemanaFeira.create({
        data: {
          diaSemanaId: diaSemana.id,
          feiraId: feira.id,
        },
      });
    }

    console.log(`Dias da semana adicionados para a feira ${feira.nome}`);

    const agora = new Date();
    const hojeNum = agora.getDay();

    const horaAgora = agora.toTimeString().substring(0, 5);

    const diasMap: Record<string, number> = {
      "Domingo": 0,
      "Segunda-feira": 1,
      "Terça-feira": 2,
      "Quarta-feira": 3,
      "Quinta-feira": 4,
      "Sexta-feira": 5,
      "Sábado": 6,
    };

    const feiraAtualizada = await prisma.feira.findUnique({
      where: { id: String(feira.id) },
      include: {
        diaSemana: {
          select: {
            diaSemana: { select: { nome: true } }
          }
        }
      }
    });

    const nomesDias = feiraAtualizada?.diaSemana.map(d => d.diaSemana.nome) || [];

    // Calcula em quantos dias ocorrerá a próxima feira
    const diffs = nomesDias.map(nome => {
      const dia = diasMap[nome];
      let diff = (dia - hojeNum + 7) % 7;

      if (diff === 0 && horaAgora < feira.horarioFim) {
        diff = 0;
      }

      if (diff === 0 && horaAgora >= feira.horarioFim) {
        diff = 7;
      }

      return diff;
    });

    const menorDiff = Math.min(...diffs);
    const proximaData = new Date(agora);
    proximaData.setDate(agora.getDate() + menorDiff);
    proximaData.setHours(0, 0, 0, 0);

    console.log(feira.nome, proximaData);

    await prisma.feira.update({
      where: { id: feira.id },
      data: { proximaOcorrencia: proximaData },
    });

    console.log(
      `Feira "${feira.nome}" → próxima ocorrência em ${proximaData.toLocaleDateString("pt-BR")}`
    );

    res.status(201).json(feira);
  } else {
    const feiraDia = await prisma.feira.update({
      where: { id: feira.id },
      data: {
        data: new Date(data),
        proximaOcorrencia: new Date(data)
      },
    });

    console.log(`Feira criada sem dias da semana, data definida: ${feiraDia.data}`);
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
router.patch("/:id", upload.single("imagem"), async (req, res) => {
  const { id } = req.params;
  const {
    horarioInicio,
    horarioFim,
    descricao,
    data
  } = req.body;

  let { tags, diaSemana } = req.body;

  let imagemUrl: string | null = null;

  try {
    if (req.file) {
      const uploaded = await put(
        `feiras/${Date.now()}-${req.file.originalname}`,
        req.file.buffer,
        {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        }
      );
      imagemUrl = uploaded.url;
      console.log("Imagem enviada para o Blob:", imagemUrl);
    }
  } catch (err) {
    console.error("Erro no upload para Blob:", err);
    return res.status(500).json({ message: "Falha ao enviar imagem" });
  }

  console.log(`Atualizando feira com ID: ${id}`);

  let turno = "";
  if (horarioInicio && horarioFim) {
    console.log(`Horários recebidos: Início - ${horarioInicio}, Fim - ${horarioFim}`);

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

  const feira = await prisma.feira.update({
    where: { id: id },
    data: {
      horarioInicio,
      horarioFim,
      descricao,
      imagem: imagemUrl,
      data,
      turno
    },
  });

  if (tags && tags.length > 0) {
    // Remove tags antigas
    await prisma.feiraTag.deleteMany({
      where: { feiraId: id },
    });

    tags = JSON.parse(tags);

    // Adiciona novas tags
    for (const tag of tags) {
      const findTag = await prisma.tag.findFirst({
        where: { nome: tag },
      })

      if (!findTag) {
        console.log("Ignorando tag inexistente:", tag);
      }
      if (findTag) {
        console.log("Adicionando tag: ", tag);
        
        await prisma.feiraTag.create({
        data: {
          feiraId: id,
          tagId: findTag.id,
        },
      });
    }
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