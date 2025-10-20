# WhatsApp Integration Service

Sistema de integração multi-instância com WhatsApp usando Node.js, TypeScript e Socket.IO.

## 🚀 Funcionalidades

- **Múltiplas Conexões**: Gerencia várias instâncias do WhatsApp simultaneamente
- **QR Code em Tempo Real**: Gera QR codes via WebSocket para autenticação
- **Persistência de Estado**: Salva estados de conexão para reconexão automática
- **API REST**: Endpoints para gerenciar integrações
- **WebSocket**: Comunicação em tempo real para criação de integrações

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- PostgreSQL (configurado via Docker)
- NPM ou Yarn

## 🛠️ Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (crie um arquivo `.env`):
```env
POSTGRES_USER=seu_usuario
POSTGRES_PASSWORD=sua_senha
POSTGRES_DB=whatsapp_integration
```

4. Inicie o banco de dados:
```bash
docker-compose up -d
```

5. Execute o projeto:
```bash
npm run dev
```

## 🌐 Endpoints

### API REST (Porta 3000)

- `GET /integrations/new` - Criar nova integração
- `DELETE /integrations/delete/:uuid` - Deletar integração

### WebSocket (Porta 3030)

#### Eventos do Cliente para Servidor:
- `create-integration` - Solicita criação de nova integração
- `delete-integration` - Solicita exclusão de integração

#### Eventos do Servidor para Cliente:
- `integration-created` - Confirma criação da integração
- `qr-code` - Emite o QR code para autenticação
- `integration-deleted` - Confirma exclusão da integração
- `error` - Emite erros

## 💻 Como Usar

### Via WebSocket (Recomendado)

```javascript
const socket = io('http://localhost:3030');

// Criar nova integração
socket.emit('create-integration');

// Receber QR code
socket.on('qr-code', (data) => {
    console.log('\n############\nQR Code:\n############\n', data.qr);
});

// Receber confirmação de criação
socket.on('integration-created', (data) => {
    console.log('Integração criada:', data.uuid);
});
```

### Via API REST

```bash
# Criar nova integração
curl -X GET http://localhost:3000/integrations/new

# Deletar integração
curl -X DELETE http://localhost:3000/integrations/delete/{uuid}
```

## 🎨 Interface Web

Abra o arquivo `index.html` no navegador para usar a interface gráfica que demonstra:

- Criação de integrações via WebSocket
- Exibição de QR codes em tempo real
- Log de eventos
- Status de conexão

## 📁 Estrutura do Projeto

```
src/
├── app.ts                 # Configuração principal do servidor
├── controllers/           # Controladores da API
├── routes/               # Definição de rotas
├── services/             # Lógica de negócio
│   ├── whatsappService.ts    # Serviço WhatsApp
│   └── integrationService.ts # Serviço de integrações
└── utils/                # Utilitários
```

## 🔧 Configuração

### Estados de Conexão
Os estados das conexões WhatsApp são salvos em `./states/{uuid}/` para permitir reconexão automática.

### Banco de Dados
O PostgreSQL é usado para armazenar dados das integrações (configuração via Docker Compose).

## 🚨 Limitações

- Cada instância do WhatsApp deve ser única
- QR codes expiram após alguns minutos
- Reconexão automática apenas para desconexões não intencionais

## 📝 Logs

O sistema gera logs detalhados para:
- Criação/exclusão de integrações
- Geração de QR codes
- Status de conexões
- Erros e reconexões

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.