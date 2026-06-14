@echo off
title Azad Khabar — Stop Server
taskkill /f /im node.exe >nul 2>nul
taskkill /f /im node.exe >nul 2>nul
echo Server stopped.
timeout /t 2 /nobreak >nul
