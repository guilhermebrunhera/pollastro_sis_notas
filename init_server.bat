@echo off
cd /d "C:\Users\Pollastro\Desktop\pollastro_sis_notas\frontend"

:: Inicia o frontend com o script Node
start "" /b serve -s dist -l 3010

:: Inicia o backend
start "" /b node ../backend/server.cjs

exit