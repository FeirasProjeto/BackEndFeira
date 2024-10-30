import express from 'express'
const app = express()
const port = 3000

// const port = process.env.PORT ?? 3000

import userRoutes from './routes/user'
import feiraRoutes from './routes/feira'
import favoritoRoutes from './routes/favorito'

app.use(express.json())
app.use("/user", userRoutes)
app.use("/feira", feiraRoutes)
app.use("/favorito", favoritoRoutes)

app.get('/', (req, res) => {
  res.send('API de ')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: http://localhost:${port}`)
})