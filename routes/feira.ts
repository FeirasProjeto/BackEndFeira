import { PrismaClient } from "@prisma/client"
import { Router } from "express"

const prisma = new PrismaClient()
const router = Router()

// CRUD 
// Read
router.get("/", async (req, res) => {
  const feiras = await prisma.feira.findMany()
  res.status(200).json(feiras)
})

// Get feira especifica
router.get("/:id", async (req, res) => {
  const { id } = req.params

  const feira = await prisma.feira.findUnique({
    where: { id: id}
  })
  res.status(200).json(feira)
})

// filtros
router.get("/:id", async (req, res) => {
  const { id } = req.params

  const feira = await prisma.feira.findUnique({
    where: { id: id}
  })
  res.status(200).json(feira)
})


// Create
router.post("/", async (req, res) => {
  const { nome, endereco, numero, cidade, coordenada, horario, data, descricao, imagem, userId  } = req.body

  const feira = await prisma.feira.create({
    data: { nome, endereco, numero, cidade, coordenada, horario, data: new Date(data), descricao, imagem, userId }
  })
  res.status(201).json(feira)
})

// Update
router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { nome } = req.body

  const feira = await prisma.feira.update({
    where: { id: id },
    data: { nome }
  })
  res.status(200).json(feira)
})

// Delete
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  const feira = await prisma.feira.delete({
    where: { id: id }
  })
  res.status(200).json(feira)
})



export default router