import express, { Request, Response, NextFunction } from 'express';
import router from './routes';
import { Server } from 'socket.io';
import { whatsappService } from './services/whatsappService';
import { createServer } from 'node:http';
import { listSubdirectories } from './listStates';


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
  socket.on('message', (msg) => {
    console.log(msg)
  })
  console.log('a user connected', );
});
server.listen(WS_PORT, () => {
  console.log(`ws running at http://localhost:${WS_PORT}`);
});