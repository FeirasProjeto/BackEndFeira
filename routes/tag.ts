import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { z } from "zod"

const prisma = new PrismaClient()
const router = Router()

// Schema Zod para validar criação de tag
const tagSchema = z.object({
  nome: z.string().min(1, "O campo 'nome' é obrigatório."),
  categoria: z.string().min(1, "O campo 'categoria' é obrigatório.")
})

// Read all tags
router.get("/", async (req, res) => {
  const tags = await prisma.tag.findMany()
  res.status(200).json(tags)
})

// Read tag by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params

  const tag = await prisma.tag.findUnique({
    where: { id: Number(id) }
  })
  res.status(200).json(tag)
})

// Create tag
router.post("/", async (req, res) => {
  try {
    const data = tagSchema.parse(req.body) // <- Aqui validamos
    const tag = await prisma.tag.create({
      data
    })
    res.status(201).json(tag)
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

// Delete tag
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
