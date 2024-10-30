import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()
const router = Router()

function validaSenha(senha: string) {

  const mensa: string[] = []

  // .length: retorna o tamanho da string (da senha)
  if (senha.length < 8) {
    mensa.push("Erro... senha deve possuir, no mínimo, 8 caracteres")
  }

  // contadores
  let pequenas = 0
  let grandes = 0
  let numeros = 0
  let simbolos = 0


  // percorre as letras da variável senha
  for (const letra of senha) {
    // expressão regular
    if ((/[a-z]/).test(letra)) {
      pequenas++
    }
    else if ((/[A-Z]/).test(letra)) {
      grandes++
    }
    else if ((/[0-9]/).test(letra)) {
      numeros++
    } else {
      simbolos++
    }
  }

  if (pequenas == 0 || grandes == 0 || numeros == 0 || simbolos == 0) {
    mensa.push("Erro... senha deve possuir letras minúsculas, maiúsculas, números e símbolos")
  }

  return mensa
}

// CRUD 
// Read
router.get("/", async (req, res) => {
  const users = await prisma.user.findMany(
    {
      select: {
        id: true,
        nome: true,
        email: true,
        feirante: true,
        _count:{select:{favoritos:true}} }
      }
    )
    res.status(200).json(users)
  })
  
// Create
router.post("/", async (req, res) => {
  const { nome, email, senha, feirante, telefone } = req.body

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
      data: { nome, email, senha: hash, feirante, telefone }
    })
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Update
router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { feirante } = req.body

  const user = await prisma.user.update({
    where: { id: id },
    data: { feirante }
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