# Script PowerShell para iniciar la aplicación en el navegador predeterminado
$indexPath = Join-Path -Path $PSScriptRoot -ChildPath "index.html"
Write-Host "Abriendo Generador de Patrones en Cuadrados..." -ForegroundColor Green
Start-Process $indexPath
