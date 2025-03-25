import express, { Request, Response, NextFunction } from 'express';
import router from './routes';
import { connectToWhatsApp } from './whatsapp';
import { whatsappService } from './services/whatsappService';


const app = express();
app.use(router);

async function initializeConnections() {
  const integrations = ['123456789'];
  for (const uuid of integrations) {
      await whatsappService.startConnection(uuid);
  }
}

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  initializeConnections()
});