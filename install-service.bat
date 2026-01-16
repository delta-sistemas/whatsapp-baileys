@echo off
REM install-service.bat - Executar como Administrador
setlocal enabledelayedexpansion

echo Instalando servico WhatsApp Baileys...

set SERVICE_NAME=whatsapp-baileys
set "NODE_PATH=C:\Program Files\nodejs\node.exe"
set APP_DIR=%~dp0
set LOG_DIR=C:\logs

:: Verificar se APP_DIR termina com barra e remover
if "%APP_DIR:~-1%"=="\" (
    set APP_DIR=%APP_DIR:~0,-1%
)

echo Verificando caminhos do sistema...
echo SERVICE_NAME = %SERVICE_NAME%
echo NODE_PATH = %NODE_PATH%
echo APP_DIR = %APP_DIR%
echo LOG_DIR = %LOG_DIR%

:: Criar diretorio de logs
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

:: Instalar dependências e compilar o projeto
echo Instalando dependencias...
cd /d "%APP_DIR%"
call npm install
echo Compilando o projeto...
call npm run build

:: Parar e remover servico existente
echo Parando e removendo servico existente...
nssm stop "%SERVICE_NAME%" 2>nul
timeout /t 3 /nobreak >nul
nssm remove "%SERVICE_NAME%" confirm 2>nul

:: Instalar novo servico
echo Instalando novo servico...
nssm install "%SERVICE_NAME%" "%NODE_PATH%"
if errorlevel 1 (
    echo ERRO: Falha na instalacao do servico!
    pause
    exit /b 1
)

nssm set "%SERVICE_NAME%" AppParameters "dist/src/app.js"
nssm set "%SERVICE_NAME%" AppDirectory "%APP_DIR%"
nssm set "%SERVICE_NAME%" DisplayName "WhatsApp Baileys"
nssm set "%SERVICE_NAME%" Description "Servico WhatsApp Baileys API"
nssm set "%SERVICE_NAME%" Start SERVICE_AUTO_START
nssm set "%SERVICE_NAME%" AppStdout "%LOG_DIR%\%SERVICE_NAME%-stdout.log"
nssm set "%SERVICE_NAME%" AppStderr "%LOG_DIR%\%SERVICE_NAME%-stderr.log"
nssm set "%SERVICE_NAME%" AppRestartDelay 10000
nssm set "%SERVICE_NAME%" AppRotateFiles 1
nssm set "%SERVICE_NAME%" AppRotateOnline 1
nssm set "%SERVICE_NAME%" AppRotateSeconds 86400
nssm set "%SERVICE_NAME%" AppRotateBytes 10485760

:: Configurar dependencias com tratamento robusto
echo Configurando dependencias...
call :configure_dependencies
goto :start_service

:configure_dependencies
    nssm set "%SERVICE_NAME%" DependOnService "Tcpip"
    echo Tentando DependOnGroup Tcpip...
    nssm set "%SERVICE_NAME%" DependOnGroup "Tcpip" >nul 2>&1
    echo DependOnGroup %errorlevel%
    if not errorlevel 1 (
        echo [SUCESSO] DependOnGroup Tcpip configurado
        exit /b 0
    )
    
    echo Tentando DependOnGroup Network...
    nssm set "%SERVICE_NAME%" DependOnGroup "Network" >nul 2>&1
    echo Network %errorlevel%
    if not errorlevel 1 (
        echo [SUCESSO] DependOnGroup Network configurado
        exit /b 0
    )
    
    echo Tentando DependOnService Tcpip...
    nssm set "%SERVICE_NAME%" DependOnService "Tcpip" >nul 2>&1
    echo DependOnService %errorlevel%
    if not errorlevel 1 (
        echo [SUCESSO] DependOnService Tcpip configurado
        exit /b 0
    )
    
    echo Tentando DependOnService Dhcp...
    nssm set "%SERVICE_NAME%" DependOnService "Dhcp" >nul 2>&1
    if not errorlevel 1 (
        echo [SUCESSO] DependOnService Dhcp configurado
        exit /b 0
    )
    
    echo [AVISO] Nenhuma dependencia configurada - continuando sem dependencias
    exit /b 1

:start_service
echo.
echo Iniciando o servico...
nssm start "%SERVICE_NAME%" >nul 2>&1

if errorlevel 1 (
    echo ERRO: Nao foi possivel iniciar o servico!
    echo Verifique os logs em: %LOG_DIR%\
) else (
    echo [SUCESSO] Servico instalado e iniciado!
)

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
exit /b 0