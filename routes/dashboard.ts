import { PrismaClient } from "@prisma/client"
import { count } from "console"
import { Router } from "express"

const prisma = new PrismaClient()
const router = Router()

// Pega dados para o dashboard do admin
router.get("/", async (req, res) => {
  const usersAtivos = await prisma.user.count({
    where: { bloqueado: false, admin: false },
  })

  const feirasAtivas = await prisma.feira.count({
    where: { deleted: false },
  })

  const avaliacoes = await prisma.avaliacao.count()

  // feiras novas (30d)
  const feirasNovas = await prisma.feira.count({
    where: {
      deleted: false,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  })

  const tags = await prisma.feiraTag.groupBy({
    by: ["tagId"],
    _count: {
      tagId: true,
    },
    orderBy: {
      _count: {
        tagId: "desc",
      },
    },
    take: 7,
  })

  const tagsPopulares = await Promise.all(
    tags.map(async t => {
      const tag = await prisma.tag.findUnique({
        where: { id: t.tagId },
      })

      return {
        tag: tag?.nome,
        quantidade: t._count.tagId,
      }
    })
  )

  const categorias = await prisma.categoriaFeira.groupBy({
      by: ["categoriaId"],
      _count: {
        categoriaId: true,
      },
      orderBy: {
        _count: {
          categoriaId: "desc",
        },
      },
      take: 7,
    }
  )

  const categoriasPopulares = await Promise.all(
    categorias.map(async c => {
      const categoria = await prisma.categoria.findUnique({
        where: { id: c.categoriaId },
      })

      return {
        asset: categoria?.nome,
        amount: c._count.categoriaId,
      }
    })
  )

  res.status(200).json({
    usersAtivos,
    feirasAtivas,
    avaliacoes,
    feirasNovas,
    tagsPopulares,
    categoriasPopulares
  })
})

router.get("/feiras", async (req, res) => {
  const feiras = await prisma.feira.findMany({
    where: { aprovada: false },
    orderBy: { createdAt: "asc" },
  })

  res.status(200).json(feiras)
})

router.patch("/aprovar/:id", async (req, res) => {
  const { id } = req.params

  const feira = await prisma.feira.update({
    where: { id },
    data: { aprovada: true },
  })

  res.status(200).json(feira)
})

export default router
