import Mailjet from "node-mailjet";

export async function enviaEmail(nome: string, email: string, codigo: string): Promise<void> {
  try {
    const { MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE } = process.env;

    if (!MJ_APIKEY_PUBLIC || !MJ_APIKEY_PRIVATE) {
      throw new Error("Chaves do Mailjet não configuradas nas variáveis de ambiente.");
    }

    const mailjet = Mailjet.apiConnect(MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE);

    const messageData = {
      Messages: [
        {
          From: {
            Email: "feirass.projeto@gmail.com",
            Name: "Minha Feira",
          },
          To: [
            {
              Email: email,
              Name: nome,
            },
          ],
          Subject: "Código de alteração de senha",
          TextPart: `Olá, ${nome}. Seu código de verificação é: ${codigo}`,
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
              <h2>Olá, ${nome}!</h2>
              <p>Seu código de verificação é:</p>
              <h1 style="color: #2e7d32;">${codigo}</h1>
              <p>Use este código para concluir a redefinição de sua senha.</p>
              <hr style="margin-top: 30px;">
              <p style="font-size: 12px; color: #777;">
                Este e-mail foi enviado automaticamente por <strong>Minha Feira</strong>.
              </p>
            </div>
          `,
        },
      ],
    };

    const response = await mailjet.post("send", { version: "v3.1" }).request(messageData);

    console.log(`E-mail enviado com sucesso para ${email}`);
    console.log("Mailjet Response:", response.body);
  } catch (error: any) {
    console.error("Erro ao enviar e-mail:", error.message || error);
    throw new Error("Falha no envio de e-mail. Tente novamente mais tarde.");
  }
}
