import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from "bcrypt"
import { validaSenha } from "../uteis/validaSenha"

const prisma = new PrismaClient()
const router = Router()

// CRUD 
// Read
router.get("/", async (req, res) => {
  const users = await prisma.user.findMany(
    {
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        _count: { select: { favoritos: true } }
      }
    }
  )
  res.status(200).json(users)
})

router.get("/:id", async (req, res) => {
  const { id } = req.params

  const user = await prisma.user.findUnique({
    where: { id: id },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      _count: { select: { favoritos: true } }
    }
  })
  res.status(200).json(user)
})

// Create
router.post("/", async (req, res) => {
  const { nome, email, senha, telefone } = req.body

  const erros = validaSenha(senha)
  if (erros.length > 0) {
    res.status(400).json({ erro: erros.join("; ") })
    return
  }

  // verifica se o email já está cadastrado
  const userCadastrado = await prisma.user.findFirst({
    where: { email }
  })

  if (userCadastrado) {
    res.status(400).json({ erro: "E-mail já cadastrado" })
    return
  }


  // 12 é o número de voltas (repetições) que o algoritmo faz
  // para gerar o salt (sal/tempero)
  const salt = bcrypt.genSaltSync(12)
  // gera o hash da senha acrescida do salt
  const hash = bcrypt.hashSync(senha, salt)

  // para o campo senha, atribui o hash gerado
  try {
    const user = await prisma.user.create({
      data: { nome, email, senha: hash, telefone }
    })
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Update
router.patch("/:id", async (req, res) => {
  const { id } = req.params
  const { nome, email, telefone } = req.body

  const user = await prisma.user.update({
    where: { id: id },
    data: { nome, email, telefone }
  })
  res.status(200).json(user)
})

// Delete
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  const user = await prisma.user.delete({
    where: { id: id }
  })
  res.status(200).json(user)
})

export default router