!macro customInstall
  DetailPrint "Register botemulator URI Handler"
  DeleteRegKey HKCU "SOFTWARE\Classes\botemulator"
  WriteRegStr HKCU "SOFTWARE\Classes\botemulator" "" "URL:Bot Emulator"
  WriteRegStr HKCU "SOFTWARE\Classes\botemulator" "URL Protocol" ""
  WriteRegStr HKCU "SOFTWARE\Classes\botemulator\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},1"
  WriteRegStr HKCU "SOFTWARE\Classes\botemulator\shell" "" ""
  WriteRegStr HKCU "SOFTWARE\Classes\botemulator\shell\open" "" ""
  WriteRegStr HKCU "SOFTWARE\Classes\botemulator\shell\open\command" "" `"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"`
!macroend