import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const router = Router();

router.post("/", async (req, res) => {
  const { email, senha } = req.body;

  // em termos de segurança, o recomendado é exibir uma mensagem padrão
  // a fim de evitar de dar "dicas" sobre o processo de login para hackers
  var mensaPadrao = "Login ou senha incorretos";

  if (!email || !senha) {
    // res.status(400).json({ erro: "Informe e-mail e senha do usuário" })
    console.log("Login ou senha incorretos");
    res.status(400).json({ erro: mensaPadrao });
    return;
  }

  try {
    const usuario = await prisma.user.findFirst({
      where: { email },
    });

    if (usuario == null) {
      // res.status(400).json({ erro: "E-mail inválido" })
      console.log("Erro ao fazer login");
      res.status(400).json({ erro: mensaPadrao });
      return;
    }
    // se o e-mail existe, faz-se a comparação dos hashs
    if (bcrypt.compareSync(senha, usuario.senha)) {
      // se confere, gera e retorna o token
      const token = jwt.sign(
        {
          userLogadoId: usuario.id,
          userLogadoNome: usuario.nome,
        },
        process.env.JWT_KEY as string,
        { expiresIn: "1h" }
      );

      console.log(`Usuário logado com sucesso`);
      res.status(200).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        admin: usuario.admin,
        token
      });

      await prisma.$transaction([
        prisma.user.update({
          where: { id: usuario.id },
          data: { tentativas: { set: 0 } }
        }),
      ]);
    } else {
      console.log("Login ou senha incorretos");
      res.status(400).json({ erro: mensaPadrao });
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(400).json(error);
  }
});

export default router;
