import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { z } from "zod"

const prisma = new PrismaClient()
const router = Router()

// Esquema de validação com Zod
const categoriaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cor: z.string().min(1, "Cor é obrigatória"),
})

// Listar categorias
router.get("/", async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany()
    res.status(200).json(categorias)
  } catch (err) {
    console.error("Erro ao buscar categorias:", err)
    res.status(500).json({ error: "Erro interno ao buscar categorias." })
  }
})

// Criar nova categoria
router.post("/", async (req, res) => {
  const parse = categoriaSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ error: "Dados inválidos", detalhes: parse.error.format() })
  }

  const { nome, cor } = parse.data

  try {
    // Evitar duplicações
    const existe = await prisma.categoria.findFirst({ where: { nome } })
    if (existe) {
      return res.status(409).json({ error: "Categoria com esse nome já existe." })
    }

    const novaCategoria = await prisma.categoria.create({
      data: { nome, cor }
    })
    res.status(201).json(novaCategoria)
  } catch (err) {
    console.error("Erro ao criar categoria:", err)
    res.status(500).json({ error: "Erro interno ao criar categoria." })
  }
})

// Deletar categoria por ID
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" })
  }

  try {
    const deletada = await prisma.categoria.delete({
      where: { id }
    })
    res.status(200).json(deletada)
  } catch (err) {
    console.error("Erro ao deletar categoria:", err)
    res.status(500).json({ error: "Erro interno ao deletar categoria." })
  }
})

// Atualizar categoria por ID
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" })
  }

  const parse = categoriaSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ error: "Dados inválidos", detalhes: parse.error.format() })
  }

  const { nome, cor } = parse.data

  try {
    const atualizada = await prisma.categoria.update({
      where: { id },
      data: { nome, cor }
    })
    res.status(200).json(atualizada)
  } catch (err) {
    console.error("Erro ao atualizar categoria:", err)
    res.status(500).json({ error: "Erro interno ao atualizar categoria." })
  }
})

export default router
