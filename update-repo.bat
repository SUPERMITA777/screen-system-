@echo off
echo Actualizando repositorio...

:: Verificar si hay cambios sin commitear
git status

:: Agregar todos los cambios
git add .

:: Solicitar mensaje de commit
set /p commit_msg="Ingrese el mensaje del commit: "

:: Crear commit
git commit -m "%commit_msg%"

:: Subir cambios
git push

echo.
echo Actualización completada!
echo.
pause 