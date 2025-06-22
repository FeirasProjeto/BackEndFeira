import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import * as swaggerDoc from './docs/swaggerDoc.json'; 

// Importação das rotas
import userRoutes from './routes/user';
import feiraRoutes from './routes/feira';
import favoritoRoutes from './routes/favorito';
import tagRoutes from './routes/tag';
import diaSemanaRoutes from './routes/diaSemana';
import loginRoutes from './routes/login';
import altSenhaRoutes from './routes/altSenha';
import avaliacaoRoutes from './routes/avaliacao';
import categoriaRoutes from './routes/categoria';

const app = express();
const port = process.env.PORT ?? 3000;

// Configuração do Swagger
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

// Middlewares
app.use(express.json());
app.use(cors());

// Rotas
app.use("/usuario", userRoutes);
app.use("/feira", feiraRoutes);
app.use("/favorito", favoritoRoutes);
app.use("/tag", tagRoutes);
app.use('/diaSemana', diaSemanaRoutes);
app.use('/login', loginRoutes);
app.use('/altSenha', altSenhaRoutes);
app.use('/avaliacao', avaliacaoRoutes);
app.use('/categoria', categoriaRoutes);

// Rota do Swagger UI
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerDoc, { customCssUrl: CSS_URL })
);

app.get('/', (req, res) => {
  res.json({ 
    message: 'API operacional',
    docs: '/api-docs',  // Link para o Swagger
    endpoints: ['/usuario', '/feira', '/login']  // Lista de endpoints
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta: http://localhost:${port}`);
  console.log(`Documentação Swagger: http://localhost:${port}/api-docs`);
});