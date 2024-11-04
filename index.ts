import express from 'express'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import path from 'path'

const caminho = path.resolve(__dirname, 'swaggerDoc.yaml')

const swaggerDoc = YAML.load(caminho)


const app = express()
// const port = 3000
const port = process.env.PORT ?? 3000



import userRoutes from './routes/user'
import feiraRoutes from './routes/feira'
import favoritoRoutes from './routes/favorito'

app.use(express.json())
app.use("/user", userRoutes)
app.use("/feira", feiraRoutes)
app.use("/favorito", favoritoRoutes)


app.use('', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

app.listen(port, () => {
  console.log(`Servidor rodando na porta: http://localhost:${port}`)
})