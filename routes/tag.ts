import { PrismaClient } from "@prisma/client"
import { Router } from "express"

const prisma = new PrismaClient()
const router = Router()

// CRUD 
// Read
router.get("/", async (req, res) => {
    const tags = await prisma.tag.findMany()
    res.status(200).json(tags)
})

router.get("/:id", async (req, res) => {
    const { id } = req.params
  
    const tag = await prisma.tag.findUnique({
      where: { id: id }
    })
    res.status(200).json(tag)
  })

// Create
router.post("/", async (req, res) => {
  const { nome } = req.body


  const tag = await prisma.tag.create({
    data: { nome }
  })
  res.status(201).json(tag)
})


// Delete
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
  const tag = await prisma.tag.delete({
    where: { id: id }
  })
  res.status(200).json(tag)
  } catch (error) {
    res.status(400).json({ error: "Id invalido" })
  }
})




export default router