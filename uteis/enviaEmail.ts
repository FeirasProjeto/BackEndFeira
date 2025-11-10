import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

export async function enviaEmail(nome: string, email: string, codigo: string) {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY as string,
    // When you have an EU-domain, you must specify the endpoint:
    // url: "https://api.eu.mailgun.net"
  });
  try {
    const data = await mg.messages.create("minha-feira.vercel.app", {
      from: "Minha Feira <feirass.projeto@gmail.com>",
      to: email,
      subject: "Código de alteração de senha",
      text: "Olá, " + nome + ". Seu código é: " + codigo,
      html: `<h2>Olá, ${nome}</h2><h3>Seu código de verificação é:</h3><h1>${codigo}</h1>`,
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}
