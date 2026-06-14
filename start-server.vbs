' Azad Khabar — Hidden launcher for Windows
' Double-click once, runs invisibly in background (system tray only in Task Manager)

Dim shell, fso, scriptDir, logFile
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
logFile = scriptDir & "\server.log"

Set shell = CreateObject("WScript.Shell")

' Kill any previous instance
shell.Run "cmd /c taskkill /f /im node.exe >nul 2>nul", 0, True

' Wait a moment for port to free
WScript.Sleep 2000

' Start the pinger (hidden)
shell.Run "cmd /c cd /d """ & scriptDir & """ && start /B node pinger.js >> """ & logFile & """ 2>&1", 0, False

' Start Next.js server (hidden) — first tries production, falls back to dev
shell.Run "cmd /c cd /d """ & scriptDir & """ && start /B npx next start -p 3000 >> """ & logFile & """ 2>&1", 0, False

' Write to log
Dim logEntry
logEntry = Now & " — Server started from " & scriptDir
Set f = fso.OpenTextFile(logFile, 8, True)
f.WriteLine logEntry
f.Close

' Confirm to user (popup auto-closes after 3 seconds)
shell.Popup "آزاد خبر — Server is now running on http://localhost:3000" & vbCrLf & vbCrLf & "It will start automatically when you log in.", 3, "Azad Khabar", 64
