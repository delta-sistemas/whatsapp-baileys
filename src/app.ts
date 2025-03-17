import express, { Request, Response, NextFunction } from 'express';
import router from './routes';
import { connectToWhatsApp } from './whatsapp';

// Criar uma instância do Express
const app = express();

app.use(router);

connectToWhatsApp({ uuid: '123456789' })

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});