import express from 'express'
import swaggerUi from 'swagger-ui-express'
import path from 'path'

const caminho = path.resolve(__dirname, 'swaggerDoc.json')

const swaggerDoc = require(caminho) 


const app = express()
// const port = 3000
const port = process.env.PORT ?? 3000

// const uiOptions = {
//   customSiteTitle: 'Minha Feira',
//   customfavIcon: 'https://imgur.com/a/SuX7ynl'
// }

const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css"


import userRoutes from './routes/user'
import feiraRoutes from './routes/feira'
import favoritoRoutes from './routes/favorito'
import swaggerJSDoc from 'swagger-jsdoc'

app.use(express.json())
app.use("/usuario", userRoutes)
app.use("/feira", feiraRoutes)
app.use("/favorito", favoritoRoutes)


app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDoc, {customCssUrl: CSS_URL}))

// app.get('/', swaggerUi.setup(swaggerDoc, uiOptions))



app.listen(port, () => {
  console.log(`Servidor rodando na porta: http://localhost:${port}`)
})