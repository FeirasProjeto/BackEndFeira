import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from "bcrypt"
import { validaSenha } from "../uteis/validaSenha"
import multer from "multer"
import { z } from "zod"

const prisma = new PrismaClient()
const router = Router()

const upload = multer({ storage: multer.memoryStorage() });

const userSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  horario: z.string().min(1, "Horário é obrigatório"),
  diaSemana: z.string().min(1, "Dia da semana é obrigatório"),
  imagem: z.string().optional(),
  telefone: z.string().optional(),
})

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
        imagem: true,
        favoritos: true,
        Avaliacoes: true,
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
      imagem: true,
      favoritos: true,
      Avaliacoes: true,
      _count: { select: { favoritos: true } }
    }
  })
  res.status(200).json(user)
})

// Create com imagem
router.post("/", upload.single("imagem"), async (req, res) => {
  const { 
    nome, 
    email, 
    senha, 
    telefone 
  } = req.body

    const imagem = req.file?.buffer.toString("base64") || null;
    
    if (
      !nome ||
      !email ||
      !senha ||
      !telefone
    )
    {
      res.status(400)
      .json({
        message: "Todos os campos devem ser preenchidos",
        campoFaltante: !nome 
        ? "nome" : !email ? "email" : !senha ? "senha" : "telefone"
      });
    }
    // Verifica se a imagem foi enviada
    if (!imagem) {
      res.status(400).json({ erro: "Imagem nao enviada" })
      return
    }
    

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

  //12 é o número de voltas (repetições) que o algoritmo faz
  // para gerar o salt (sal/tempero)
  const salt = bcrypt.genSaltSync(12)
  // gera o hash da senha acrescida do salt
  const hash = bcrypt.hashSync(senha, salt)

  // para o campo senha, atribui o hash gerado
  try {
    const user = await prisma.user.create({
      data: { nome, email, senha: hash, telefone, imagem }
    })
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json(error)
  }

  res.status(201).json({ message: "Usuário criado com sucesso!" })
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