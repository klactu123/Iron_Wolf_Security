' Launch the Interactive Python Trainer with NO console window.
' Double-click this file. It starts the server with pythonw.exe (console-less),
' opens your browser, and leaves nothing on screen.
' To stop the server later, run stop_trainer.bat.
Dim fso, sh, dir
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = dir
' 0 = hidden window, False = don't wait for it to finish
sh.Run "pythonw """ & dir & "\server.py""", 0, False
