import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { z } from "zod"

const prisma = new PrismaClient()
const router = Router()

// Schema para uma tag
const tagSchema = z.object({
  nome: z.string().min(1, "O campo 'nome' é obrigatório."),
  categoria: z.string().min(1, "O campo 'categoria' é obrigatório.")
})

// Schema para array de tags
const multipleTagsSchema = z.array(tagSchema)

// Listar todas as tags
router.get("/", async (req, res) => {
  const tags = await prisma.tag.findMany()
  res.status(200).json(tags)
})

// Buscar tag por ID
router.get("/:id", async (req, res) => {
  const { id } = req.params
  const tag = await prisma.tag.findUnique({
    where: { id: Number(id) }
  })
  res.status(200).json(tag)
})

// Criar tag(s) - aceita um objeto ou um array de objetos
router.post("/", async (req, res) => {
  try {
    // Detecta se o corpo é array ou objeto e valida
    let tagsData: Array<{ nome: string; categoria: string }>
    if (Array.isArray(req.body)) {
      tagsData = multipleTagsSchema.parse(req.body)
    } else {
      const singleTag = tagSchema.parse(req.body)
      tagsData = [singleTag]
    }

    // Extrai categorias únicas das tags recebidas
    const categoriasRecebidas = [...new Set(tagsData.map(t => t.categoria))]

    // Busca categorias existentes no banco
    const categoriasExistentes = await prisma.categoria.findMany({
      where: { nome: { in: categoriasRecebidas } },
      select: { nome: true }
    })

    const nomesValidos = categoriasExistentes.map(c => c.nome)

    // Verifica se há categorias inválidas
    const invalidas = categoriasRecebidas.filter(cat => !nomesValidos.includes(cat))
    if (invalidas.length > 0) {
      return res.status(400).json({
        message: "Categorias inválidas encontradas.",
        categoriasInvalidas: invalidas
      })
    }

    // Cria as tags (em transação para o array)
    const tagsCriadas = await prisma.$transaction(
      tagsData.map(tag => prisma.tag.create({ data: tag }))
    )

    res.status(201).json(tagsCriadas.length === 1 ? tagsCriadas[0] : tagsCriadas)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Erro de validação",
        errors: error.errors
      })
    }
    res.status(500).json({ message: "Erro interno do servidor", error })
  }
})

// Deletar tag
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const feira = await prisma.feira.findMany({
      where: {
        tags: {
          some: {
            tagId: Number(id)
          }
        }
      }
    })

    if (feira.length > 0) {
      await prisma.feiraTag.deleteMany({
        where: {
          tagId: Number(id)
        }
      })
    }

    const tag = await prisma.tag.delete({
      where: { id: Number(id) }
    })

    res.status(200).json(tag)
  } catch (error) {
    res.status(400).json({ message: "Id inválido", error })
  }
})

export default router
