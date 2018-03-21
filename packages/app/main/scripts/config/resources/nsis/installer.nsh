!macro customInit
    ; Attempt to uninstall older, squirrel-based app.
    ;DetailPrint "Uninstall Squirrel-based version of application"
    ;IfFileExists "$INSTDIR\..\..\botframework\Update.exe" 0 noSquirrel
    ;nsExec::Exec '"$INSTDIR\..\..\botframework\Update.exe" --uninstall -s'
    ;noSquirrel:
!macroend

!macro customInstall
    DetailPrint "Register bfemulator URI Handler"
    DeleteRegKey HKCU "SOFTWARE\Classes\bfemulator"
    WriteRegStr HKCU "SOFTWARE\Classes\bfemulator" "" "URL:Bot Framework Emulator"
    WriteRegStr HKCU "SOFTWARE\Classes\bfemulator" "URL Protocol" ""
    WriteRegStr HKCU "SOFTWARE\Classes\bfemulator\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},1"
    WriteRegStr HKCU "SOFTWARE\Classes\bfemulator\shell" "" ""
    WriteRegStr HKCU "SOFTWARE\Classes\bfemulator\shell\open" "" ""
    WriteRegStr HKCU "SOFTWARE\Classes\bfemulator\shell\open\command" "" `"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"`
!macroend

!macro customUninstall
    DetailPrint "Unregister bfemulator URI Handler"
    DeleteRegKey HKCU "SOFTWARE\Classes\bfemulator"
    ;DetailPrint "Unregister bfemulator URI Handler"
    ;DeleteRegKey HKCU "SOFTWARE\Classes\bfemulator"
    DetailPrint "Unregister botemulator URI Handler"
    DeleteRegKey HKCU "SOFTWARE\Classes\botemulator"
!macroend
