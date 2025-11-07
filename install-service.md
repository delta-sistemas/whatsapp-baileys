# Instalação do Serviço WhatsApp Baileys

Este projeto automatiza a instalação do serviço WhatsApp Baileys como um serviço do Windows usando NSSM (Non-Sucking Service Manager).

## 📋 Pré-requisitos

Antes de executar o script de instalação, certifique-se de ter os seguintes requisitos:

### 1. **Node.js**
- Versão 14 ou superior
- Instalado em: `C:\Program Files\nodejs\`
- [Download Node.js](https://nodejs.org/)

### 2. **NSSM (Non-Sucking Service Manager)**
- Instalado via Chocolatey ou manualmente
- **Instalação via Chocolatey:**
  ```cmd
  choco install nssm
  ```
- **Instalação manual:** Baixe do [site oficial do NSSM](https://nssm.cc/)

### 3. **Permissões de Administrador**
- O script deve ser executado como Administrador

## 🚀 Instalação

### Passo 1: Preparação
1. Extraia o projeto em uma pasta (ex: `C:\whatsapp-baileys\`)
2. Certifique-se de que todos os arquivos do projeto estão presentes

### Passo 2: Executar Instalação
1. Abra o Prompt de Comando **como Administrador**
2. Navegue até a pasta do projeto:
   ```cmd
   cd C:\whatsapp-baileys\
   ```
3. Execute o script de instalação:
   ```cmd
   install-service.bat
   ```

## 🔧 O que o Script Faz

### Processo Automatizado:
1. **Verifica dependências**
   - Confirma existência do Node.js
   - Cria diretório de logs (`C:\logs\`)

2. **Instala dependências do projeto**
   - Executa `npm install`
   - Compila o projeto com `npm run build`

3. **Configura o serviço Windows**
   - Para e remove versões anteriores do serviço
   - Instala novo serviço usando NSSM
   - Configura parâmetros e diretórios
   - Define dependências de rede
   - Inicia o serviço automaticamente

### Configurações do Serviço:
- **Nome do Serviço:** `whatsapp-baileys`
- **Executável:** Node.js
- **Arquivo Principal:** `dist/src/app.js`
- **Diretório:** Local atual do script
- **Logs:** `C:\logs\whatsapp-baileys-stdout.log` e `C:\logs\whatsapp-baileys-stderr.log`
- **Inicialização:** Automática com Windows

## 📊 Comandos Úteis

### Gerenciar Serviço:
```cmd
# Iniciar serviço
nssm start whatsapp-baileys

# Parar serviço
nssm stop whatsapp-baileys

# Reiniciar serviço
nssm restart whatsapp-baileys

# Ver status
nssm status whatsapp-baileys
```

### Logs do Sistema:
```cmd
# Ver logs do serviço
type C:\logs\whatsapp-baileys-stdout.log
type C:\logs\whatsapp-baileys-stderr.log

# Ver logs do Windows
eventvwr.msc
```

### Comandos SC (Service Control):
```cmd
# Ver informações do serviço
sc query whatsapp-baileys

# Iniciar/Parar via SC
sc start whatsapp-baileys
sc stop whatsapp-baileys
```

## 🐛 Solução de Problemas

### Erro Comum: "Service is not a valid NSSM service"
**Causa:** Caminho do Node.js incorreto ou serviço não instalado corretamente
**Solução:**
- Verifique se o Node.js está instalado em `C:\Program Files\nodejs\node.exe`
- Execute o script como Administrador
- Verifique se o NSSM está instalado

### Serviço Não Inicia
**Verifique:**
1. Logs em `C:\logs\`
2. Se o arquivo `dist/src/app.js` existe após o build
3. Dependências do projeto instaladas corretamente

### Porta em Uso
**Solução:** Altere a porta no arquivo de configuração do projeto e reinstale

## 📝 Estrutura de Arquivos

```
C:\whatsapp-baileys\
├── install-service.bat      # Script de instalação
├── package.json            # Dependências do projeto
├── src/
│   └── app.js             # Arquivo principal
├── dist/
│   └── src/
│       └── app.js         # Arquivo compilado
└── C:\logs\               # Logs do serviço (criado automaticamente)
```

## 🔄 Reinstalação

Para reinstalar completamente:

1. Pare o serviço:
   ```cmd
   nssm stop whatsapp-baileys
   nssm remove whatsapp-baileys confirm
   ```

2. Execute novamente:
   ```cmd
   install-service.bat
   ```

## ⚠️ Notas Importantes

- **Sempre execute como Administrador**
- **Mantenha o Node.js atualizado**
- **Verifique os logs regularmente** para monitorar o serviço
- **O serviço inicia automaticamente** com o Windows
- **Backup dos logs** é recomendado para troubleshooting

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs em `C:\logs\`
2. Confirme que todos os pré-requisitos estão instalados
3. Execute o script como Administrador
4. Verifique se o projeto compila corretamente com `npm run build`

---

**Versão:** 1.0  
**Última Atualização:** [Data]  
**Compatível com:** Windows 10/11, Windows Server 2016+