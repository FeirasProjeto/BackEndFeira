import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();
const router = Router();

async function enviaEmail(nome: string, email: string, codigo: string) {

    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: "ca1905d4362ef7",
            pass: "2c8283f5447238",
        },
    });

        const info = await transporter.sendMail({
            from: 'feirass.projeto@gmail.com', // sender address
            to: email, // list of receivers
            subject: "Codigo de alteração de senha", // Subject line
            text: codigo, // plain text body
            html: `<h2>Olá, ${nome}</h2>
            <h3>Seu codigo de Verificação é:</h3>
            <h1>${codigo}</h1>`, // html body
        });

    return info;
}

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
        res.status(200).json({ mensagem: "Código Valido" });
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

    if (!codigo) {
        res.status(400).json({ erro: "Insira o Código de Verificação" });
        return;
    }

    const usuario = await prisma.user.findUnique({
        where: { id: usuarioId },
    });

    if (usuario?.token !== codigo) {
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