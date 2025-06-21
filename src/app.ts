import express from 'express';
import router from './routes';
import { Server } from 'socket.io';
import { whatsappService } from './services/whatsappService';
import { createIntegrationService } from './services/integrationService';
import { createServer } from 'node:http';
import { listSubdirectories } from './utils/listStates';


async function initializeConnections() {
  // LER INTEGRAÇÕES QUE JÁ ESTÃO NO DIRETÓRIO
  const integrations = await listSubdirectories('./states/');
  console.log('Iniciando conexões para as seguintes integrações:', integrations);
  for (const uuid of integrations) {
      await whatsappService.startConnection(uuid);
  }
}

// SERVER API
const app = express();
app.use(router);
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  initializeConnections()
});

// SERVER SOCKET 
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Permite todas as origens (em produção, substitua pelo seu domínio)
    methods: ["GET", "POST"]
  }
})
const WS_PORT = 3030;

io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  // Evento para criar nova integração via WebSocket
  socket.on('integration-create', async () => {
    try {
      // Callback para emitir o QR code quando gerado
      const qrCallback = (qr: string) => {
        socket.emit('qr-code', { qr });
      };

      // Cria nova integração
      const result = await createIntegrationService(qrCallback);
      
      // Emite o resultado da criação // NAO SEI SE FUNCIONA ESTA PARTE --> TESTAR
      socket.emit('integration-created', result);
      
    } catch (error: any) {
      socket.emit('error', { message: error.message });
    }
  });

  // Evento para deletar integração
  socket.on('integration-delete', async (data) => {
    try {
      const { uuid } = data;
      // Implementar lógica de deletar integração
      socket.emit('integration-deleted', { uuid });
    } catch (error: any) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
  });
});

server.listen(WS_PORT, () => {
  console.log(`WebSocket rodando na porta ${WS_PORT}`);
});