import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from "bcrypt"
import { validaSenha } from "../uteis/validaSenha"
import multer from "multer"
import { z } from "zod"
import { sendPushNotification } from "../uteis/enviaNotificacoes"

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
  res.status(200).json({ message: "Usuários encontrados:", users })
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
  res.status(200).json({ message: "Usuário encontrado", user })
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
    !senha
  ) {
    res.status(400)
      .json({
        message: "Todos os campos devem ser preenchidos",
        campoFaltante: !nome
          ? "nome" : !email ? "email" : !senha ? "senha" : "telefone"
      });
  }

  console.log(`Criando usuário`);
  
  const erros = validaSenha(senha)
  if (erros.length > 0) {
    console.log("Senha inválida:", erros);
    
    res.status(400).json({ erro: erros.join("; ") })
    return
  }

  // verifica se o email já está cadastrado
  const userCadastrado = await prisma.user.findFirst({
    where: { email }
  })

  if (userCadastrado) {
    console.log(`E-mail já cadastrado`);
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
    console.log(`Usuário criado`);
    res.status(201).json(user)
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(400).json(error)
  }

  res.status(201).json({ message: "Usuário criado com sucesso!" })
})
// Update
router.patch("/:id", upload.single("imagem"), async (req, res) => {
  const { id } = req.params
  const { nome, email, telefone } = req.body

  const imagem = req.file?.buffer.toString("base64") || null;

  console.log(`Atualizando usuário ${id}`);

  const user = await prisma.user.update({
    where: { id: id },
    data: { nome, email, telefone, imagem }
  })
  console.log(`Usuário atualizado com sucesso`);
  res.status(200).json(user)
})

// Delete
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  console.log(`Deletando usuário ${id}`);

  const user = await prisma.user.delete({
    where: { id: id }
  })

  console.log(`Usuário deletado com sucesso`);
  res.status(200).json({message: "Usuário deletado com sucesso!", user})
})

router.post("/push-tokens", async (req, res) => {
  const { userId, token } = req.body;
  if (!userId || !token) {
    return res.status(400).json({ error: "userId e token são obrigatórios" });
  }

  await prisma.pushToken.upsert({
    where: { token },
    update: { token, userId },
    create: { userId, token },
  });

  res.status(200).json({ message: "Token salvo com sucesso", success: true });
});

// POST /notificar
router.post("/notificar", async (req, res) => {
  const { userIds, title, body, data } = req.body;

  // pega os tokens desses usuários no banco
  const tokens = await prisma.pushToken.findMany({
    where: { userId: { in: userIds } },
    select: { token: true },
  });

  await sendPushNotification(tokens.map((t: { token: any }) => t.token), title, body, data);

  res.json({ success: true });
});

export default router