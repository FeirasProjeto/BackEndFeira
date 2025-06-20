import express from 'express'
import swaggerUi from 'swagger-ui-express'
import path from 'path'
import cors from 'cors'

const caminho = path.resolve(__dirname, 'swaggerDoc.json')

const swaggerDoc = require(caminho) 


const app = express()
// const port = 3000
const port = process.env.PORT ?? 3000

const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css"

import userRoutes from './routes/user'
import feiraRoutes from './routes/feira'
import favoritoRoutes from './routes/favorito'
import tagRoutes from './routes/tag'
import diaSemanaRoutes from './routes/diaSemana'
import loginRoutes from './routes/login'
import altSenhaRoutes from './routes/altSenha'
import avaliacaoRoutes from './routes/avaliacao'
import categoriaRoutes from './routes/categoria'


app.use(express.json())
app.use(cors())

app.use("/usuario", userRoutes)
app.use("/feira", feiraRoutes)
app.use("/favorito", favoritoRoutes)
app.use("/tag", tagRoutes)
app.use('/diaSemana', diaSemanaRoutes)
app.use('/login', loginRoutes)
app.use('/altSenha', altSenhaRoutes)
app.use('/avaliacao', avaliacaoRoutes)
app.use('/categoria', categoriaRoutes)


app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDoc, {customCssUrl: CSS_URL, }))

// app.get('/', swaggerUi.setup(swaggerDoc, uiOptions))

app.listen(port, () => {
  console.log(`Servidor rodando na porta: http://localhost:${port}`)
})