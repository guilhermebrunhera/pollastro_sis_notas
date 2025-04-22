start "" "C:\Users\Guilherme Brunhera\Desktop\Pollastro_notas_reactVite\backend\backend.exe"


@echo off
cd /d "C:\Users\Guilherme Brunhera\Desktop\Pollastro_notas_reactVite\frontend"

:: Inicia o frontend com o script Node
start "" serve -s dist -l 3002

exit