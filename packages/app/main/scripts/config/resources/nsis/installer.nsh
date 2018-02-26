!macro customInit
    ; Attempt to uninstall older, squirrel-based app.
    ;DetailPrint "Uninstall Squirrel-based version of application"
    ;IfFileExists "$INSTDIR\..\..\botframework\Update.exe" 0 noSquirrel
    ;nsExec::Exec '"$INSTDIR\..\..\botframework\Update.exe" --uninstall -s'
    ;noSquirrel:
!macroend

!macro customInstall
    DetailPrint "Register msbots URI Handler"
    DeleteRegKey HKCU "SOFTWARE\Classes\msbots"
    WriteRegStr HKCU "SOFTWARE\Classes\msbots" "" "URL:Bot Framework Emulator"
    WriteRegStr HKCU "SOFTWARE\Classes\msbots" "URL Protocol" ""
    WriteRegStr HKCU "SOFTWARE\Classes\msbots\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},1"
    WriteRegStr HKCU "SOFTWARE\Classes\msbots\shell" "" ""
    WriteRegStr HKCU "SOFTWARE\Classes\msbots\shell\open" "" ""
    WriteRegStr HKCU "SOFTWARE\Classes\msbots\shell\open\command" "" `"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"`
!macroend

!macro customUninstall
    DetailPrint "Unregister msbots URI Handler"
    DeleteRegKey HKCU "SOFTWARE\Classes\msbots"
    ;DetailPrint "Unregister bfemulator URI Handler"
    ;DeleteRegKey HKCU "SOFTWARE\Classes\bfemulator"
    DetailPrint "Unregister botemulator URI Handler"
    DeleteRegKey HKCU "SOFTWARE\Classes\botemulator"
!macroend
