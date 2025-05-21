import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcrypt";
import { enviaEmail } from "../uteis/enviaEmail";
import { validaSenha } from "../uteis/validaSenha";

const prisma = new PrismaClient();
const router = Router();

router.post("/criaCodigo", async (req, res) => {
    const { usuarioEmail } = req.body;

    try {
        // Verifica se o e-mail foi informado
        if (!usuarioEmail) {
            res.status(400).json({ erro: "Informe o e-mail do usuário" });
            return;
        }

        const usuario = await prisma.user.findFirst({
            where: { email: usuarioEmail },
        });

        if (!usuario) {
            res.status(404).json({ erro: "Usuário não encontrado" });
            return;
        }

        const recuperacao = Math.floor(100000 + Math.random() * 900000);

        await prisma.user.update({
            where: { id: usuario.id },
            data: { token: recuperacao.toString() },
        });

        const resultadoEmail = await enviaEmail(usuario.nome, usuario.email, recuperacao.toString());

        
        res.status(200).json({ mensagem: "Código de verificação enviado com sucesso",
            detalhes: resultadoEmail });
    } catch (error) {
        res.status(400).json(error);
    }
});

router.post("/verificaCodigo", async (req, res) => {
    const { usuarioEmail, codigo } = req.body;

    const usuario = await prisma.user.findFirst({
        where: { email: usuarioEmail },
    });

    if (!usuario) {
        res.status(404).json({ erro: "Usuário não encontrado" });
        return;
    }

    if (usuario.token !== codigo) {
        res.status(400).json({ erro: "Código de Verificação inválido" });
        return;
    }else {
        res.status(200).json({ mensagem: "Código Valido", userId: usuario.id });
    }
})

router.post("/:usuarioId", async (req, res) => {
    const { novaSenha, novaSenha2, codigo } = req.body;
    const { usuarioId } = req.params;

    if (!novaSenha || !novaSenha2) {
        res.status(400).json({ erro: "Informe nova senha" });
        return;
    }

    if (novaSenha !== novaSenha2) {
        res.status(400).json({ erro: "As senhas informadas devem ser iguais" });
        return;
    }

    const erros = validaSenha(novaSenha2)
    if (erros.length > 0) {
      res.status(400).json({ erro: erros.join("; ") })
      return
    }

    const usuario = await prisma.user.findUnique({
        where: { id: usuarioId },
    });

    if (!usuario) {
        res.status(404).json({ erro: "Usuário não encontrado" });
        return;
    }

    if (usuario.token !== codigo) {
        res.status(400).json({ erro: "Código de Verificação inválido" });
        return;
    }

    try {

        const salt = bcrypt.genSaltSync(12);
        const hash = bcrypt.hashSync(novaSenha, salt);

        await prisma.user.update({
            where: { id: usuarioId },
            data: { senha: hash },
        });

        res.status(200).json({ mensagem: "Senha alterada com sucesso" });
    } catch (error) {
        res.status(400).json(error);
    }
});

export default router;