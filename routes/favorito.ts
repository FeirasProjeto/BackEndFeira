import { PrismaClient } from "@prisma/client"
import { Router } from "express"

const prisma = new PrismaClient()
const router = Router()

// CRUD 
// Read
router.get("/", async (req, res) => {
  const favoritos = await prisma.favorito.findMany()
  res.status(200).json(favoritos)
})

// Create
router.post("/", async (req, res) => {
  const { userId, feiraId } = req.body

  console.log(`Criando favorito para usuário ${userId} e feira ${feiraId}`);
  
  const favorito = await prisma.favorito.create({
    data: { userId, feiraId }
  })
  console.log(`Favorito criado: ${JSON.stringify(favorito)}`);
  res.status(201).json(favorito)
})


// Delete
router.delete("/", async (req, res) => {
  const { userId, feiraId } = req.body

  console.log(`Removendo favorito para usuário ${userId} e feira ${feiraId}`);
  const favorito = await prisma.favorito.findFirst({
    where: {
      userId: userId,
      feiraId: feiraId
    }
  })

  if (!favorito) {
    return res.status(404).json({ message: "Favorito não encontrado" })
  }
  await prisma.favorito.delete({
    where: {
      id: favorito.id
    }
  })
  
  console.log(`Favorito removido: ${JSON.stringify(favorito)}`);
  res.status(200).json(favorito)
})



export default router