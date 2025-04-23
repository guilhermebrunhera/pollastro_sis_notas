@echo off
cd /d "C:\Users\Guilherme Brunhera\Desktop\Pollastro_notas_reactVite\frontend"

:: Inicia o frontend com o script Node
start "" /b serve -s dist -l 3002

:: Inicia o backend
start "" /b node ../backend/server.cjs

exit