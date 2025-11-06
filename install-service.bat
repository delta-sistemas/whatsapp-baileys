@echo off
REM install-service.bat - Executar como Administrador
setlocal enabledelayedexpansion

echo Instalando servico WhatsApp Baileys...

set SERVICE_NAME=whatsapp-baileys
set "NODE_PATH=C:\Program Files\nodejs\node.exe"
set APP_DIR=E:\Projetos\Pessoal\Simples-Chat\whatsapp-baileys
set LOG_DIR=C:\logs

:: Criar diretorio de logs
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

:: Instalar dependências e compilar o projeto
echo Instalando dependencias...
cd /d "%APP_DIR%"
call npm install
echo Compilando o projeto...
call npm run build

:: Parar e remover servico existente
nssm stop "%SERVICE_NAME%" 2>nul
nssm remove "%SERVICE_NAME%" confirm 2>nul

:: Instalar novo servico
nssm install "%SERVICE_NAME%" "%NODE_PATH%"
nssm set "%SERVICE_NAME%" AppParameters "dist/src/app.js"
nssm set "%SERVICE_NAME%" AppDirectory "%APP_DIR%"
nssm set "%SERVICE_NAME%" DisplayName "WhatsApp Baileys"
nssm set "%SERVICE_NAME%" Description "Servico WhatsApp Baileys API"
nssm set "%SERVICE_NAME%" Start SERVICE_AUTO_START
nssm set "%SERVICE_NAME%" AppStdout "%LOG_DIR%\%SERVICE_NAME%-stdout.log"
nssm set "%SERVICE_NAME%" AppStderr "%LOG_DIR%\%SERVICE_NAME%-stderr.log"
nssm set "%SERVICE_NAME%" AppRestartDelay 10000

:: Configurar variaveis de ambiente se necessario
nssm set "%SERVICE_NAME%" AppEnvironmentExtra "NODE_ENV=production"

:: Iniciar o servico
nssm start "%SERVICE_NAME%"

echo.
echo Servico instalado com sucesso!
echo.
echo Comandos uteis:
echo nssm start %SERVICE_NAME%
echo nssm stop %SERVICE_NAME%
echo nssm restart %SERVICE_NAME%
echo nssm status %SERVICE_NAME%
echo.

pause