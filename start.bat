@echo off
title Maya AI - Executive Email Management Dashboard
cls
echo ====================================================================
echo  * Maya AI - Executive Email Management Dashboard
echo  * AI Full-Stack Engineer Intern Assignment Prototype
echo ====================================================================
echo.
echo Starting Maya AI Backend Server on port 5000...
echo.

REM Launch browser automatically after 2 seconds in background
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5000"

REM Run Node.js Server
node server/server.js

pause
