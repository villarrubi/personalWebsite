@echo off
title Web de Alejandro - servidor local
cd /d "%~dp0"
echo Preparando la web...
where node >nul 2>nul
if errorlevel 1 (
  echo No se encuentra Node.js. Instala Node.js 22 o posterior y vuelve a abrir este archivo.
  pause
  exit /b 1
)
node scripts/build.mjs
if errorlevel 1 (
  pause
  exit /b
)
echo Abriendo la web en el navegador. Puedes minimizar esta ventana.
node scripts/serve.mjs --open
if errorlevel 1 (
  echo No se pudo abrir la web. Revisa el mensaje de arriba.
  pause
  exit /b 1
)
