import { PrismaClient } from "@prisma/client"
import { Router } from "express"

const prisma = new PrismaClient()
const router = Router()

// CRUD 
// Read
router.get("/", async (req, res) => {
  const diaSemanas = await prisma.diaSemana.findMany()
  res.status(200).json(diaSemanas)
})

router.get("/:id", async (req, res) => {
  const { id } = req.params

  const diaSemana = await prisma.diaSemana.findUnique({
    where: { id: id }
  })
  res.status(200).json(diaSemana)
})

export default router