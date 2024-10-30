import { PrismaClient } from "@prisma/client"
import { Router } from "express"

const prisma = new PrismaClient()
const router = Router()

// CRUD 
// Create
router.get("/", async (req, res) => {
  const favoritos = await prisma.favorito.findMany()
  res.status(200).json(favoritos)
})

// Read
router.post("/", async (req, res) => {
  const { userId, feiraId } = req.body


  const favorito = await prisma.favorito.create({
    data: { userId, feiraId }
  })
  res.status(201).json(favorito)
})


// Delete
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  const favorito = await prisma.favorito.delete({
    where: { id: id }
  })
  res.status(200).json(favorito)
})



export default router