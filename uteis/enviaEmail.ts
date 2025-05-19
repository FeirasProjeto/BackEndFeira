import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function enviaEmail(nome: string, email: string, codigo: string) {
  const msg = {
    to: email,
    from: 'feirass.projeto@gmail.com',
    subject: 'Código de alteração de senha',
    text: `Olá, ${nome}. Seu código é: ${codigo}`,
    html: `<h2>Olá, ${nome}</h2><h3>Seu código de verificação é:</h3><h1>${codigo}</h1>`,
  };

  return await sgMail.send(msg);
}
