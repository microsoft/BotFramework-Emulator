# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## Added
- [main] Added npm script to watch and auto-restart the main process in PR [1450](https://github.com/Microsoft/BotFramework-Emulator/pull/1450)
- [main] Added a splash screen to app startup in PR [1451](https://github.com/Microsoft/BotFramework-Emulator/pull/1451)

## Fixed
- [luis / client] Fixed several styling issues within the LUIS inspector, and enabled log deep link to configure missing LUIS service in PR [#1399](https://github.com/Microsoft/BotFramework-Emulator/pull/1399)
- [client] Fixed secret prompt dialog's opaque background so that it is now transparent in PR [1407](https://github.com/Microsoft/BotFramework-Emulator/pull/1407)
- [build / client] Fixed ipc issue that was breaking the command service in PR [1418](https://github.com/Microsoft/BotFramework-Emulator/pull/1418)
- [build] Bumped electron version to v4.1.1 and updated .dmg installer background image in PR [1419](https://github.com/Microsoft/BotFramework-Emulator/pull/1419)
- [ui-react] Added default disabled styling to checkbox control in PR [1424](https://github.com/Microsoft/BotFramework-Emulator/pull/1424)
- [client] Fixed issue where BOM wasn't being stripped from transcripts opened via the File menu in PR [1425](https://github.com/Microsoft/BotFramework-Emulator/pull/1425)
- [client] Fixed issue where tab icon glyphs weren't working on Mac in PR [1428](https://github.com/Microsoft/BotFramework-Emulator/pull/1428)
- [client] Fixed issue where cancelling out of opening a transcript was creating a broken livechat window in PR [1441](https://github.com/Microsoft/BotFramework-Emulator/pull/1441)
- [client] Fixed invisible scrollbar styling in log panel in PR [1442](https://github.com/Microsoft/BotFramework-Emulator/pull/1442)
- [main] Fixed issue where opening a livechat or bot via protocol wasn't working because ngrok wasn't being started on startup in PR [1446](https://github.com/Microsoft/BotFramework-Emulator/pull/1446)
- [main / client] Got rid of node Buffer() deprecation warnings in PR [1426](https://github.com/Microsoft/BotFramework-Emulator/pull/1426)

## Removed
- [main] Removed custom user agent string from outgoing requests in PR [1427](https://github.com/Microsoft/BotFramework-Emulator/pull/1427)

## v4.3.3 - 2019 - 03 - 14
## Fixed
- [client] Use correct casing for user id prop for web chat in PR [#1374](https://github.com/Microsoft/BotFramework-Emulator/pull/1374)
- [luis / qnamaker] Addressed npm security vulnerabilities in luis & qnamaker extensions in PR [#1371](https://github.com/Microsoft/BotFramework-Emulator/pull/1371)
- [main] Fixed issue where current user id was out of sync between client and main in PR [#1378](https://github.com/Microsoft/BotFramework-Emulator/pull/1378)
- [client] Fixed issue where modals were very hard to read on high contrast theme PR [#1402](https://github.com/Microsoft/BotFramework-Emulator/pull/1402)

## Removed
- [telemetry] Disabled telemetry and the ability to opt-in to collect usage data in PR [#1375](https://github.com/Microsoft/BotFramework-Emulator/pull/1375)

## v4.3.2 - 2019 - 03 - 11
## Added
- [main] Typecheck during build process [#1368](https://github.com/Microsoft/BotFramework-Emulator/pull/1368)

## Fixed
- [main] Fix missing constant reference [#1368](https://github.com/Microsoft/BotFramework-Emulator/pull/1368)

## v4.3.1 - 2019 - 03 - 11
## Fixed
- [client] Modified 'Open Bot' dialog text in PR [#1330](https://github.com/Microsoft/BotFramework-Emulator/pull/1330)
- [client] Allow text to be selected in webchat in PR [#1351](https://github.com/Microsoft/BotFramework-Emulator/pull/1351)
- [client] Pass along user name to webchat in PR [#1353](https://github.com/Microsoft/BotFramework-Emulator/pull/1353)
- [client] Native dialogs no longer display [#1360](https://github.com/Microsoft/BotFramework-Emulator/pull/1360)
- [client] Do not render certain activities in webchat in PR [#1363](https://github.com/Microsoft/BotFramework-Emulator/pull/1363)
- [core] Fixed issue with contentUrl for attachments in PR [#1364](https://github.com/Microsoft/BotFramework-Emulator/pull/1364)
- [client] Fixed issue where scrollbar within Webchat was invisible in PR [#1366](https://github.com/Microsoft/BotFramework-Emulator/pull/1366)

## v4.3.0 - 2019 - 03 - 04
### Added
- [docs] Added changelog in PR [#1230](https://github.com/Microsoft/BotFramework-Emulator/pull/1230)
- [style] 💅 Integrated prettier and eslint in PR [#1240](https://github.com/Microsoft/BotFramework-Emulator/pull/1240)
- [main / client] Added app-wide instrumentation in PR [#1251](https://github.com/Microsoft/BotFramework-Emulator/pull/1251)
- [client] Show a message when nothing has been inspected yet, in PR [#1290](https://github.com/Microsoft/BotFramework-Emulator/pull/1290)

### Fixed
- [main] Fixed issue [(#1257)](https://github.com/Microsoft/BotFramework-Emulator/issues/1257) where opening transcripts via the command line was crashing the app, in PR [#1269](https://github.com/Microsoft/BotFramework-Emulator/pull/1269).
- [main] display correct selected theme in file menu on mac, in PR [#1280](https://github.com/Microsoft/BotFramework-Emulator/pull/1280).
- [client] Renamed 'submit' button to 'save' in endpoint & service editors, in PR[#1296](https://github.com/Microsoft/BotFramework-Emulator/pull/1296)
- [main] use correct values for subscriptionKey and endpointKey for qna services, in PR [#1301](https://github.com/Microsoft/BotFramework-Emulator/pull/1301)
- [client] fix link to manage qna service, in PR [#1301](https://github.com/Microsoft/BotFramework-Emulator/pull/1301)
- [client] Fixed resources pane styling issues, and added scrollbars, in PR [#1303](https://github.com/Microsoft/BotFramework-Emulator/pull/1303)
- [client] Fixed issue where transcript tab name was being overwritten after opening the transcript a second time, in PR [#1304](https://github.com/Microsoft/BotFramework-Emulator/pull/1304)
- [client] Fixed issue where links pointing to data urls were opening the Windows store, in PR [#1315](https://github.com/Microsoft/BotFramework-Emulator/pull/1315)
- [client] Fixed Azure gov checkbox and added a link to docs, in PR [#1292](https://github.com/Microsoft/BotFramework-Emulator/pull/1292)
- [client] Fixed issue where restart conversation was not clearing history, in PR [#1325](https://github.com/Microsoft/BotFramework-Emulator/pull/1325)
- [luis] Fixed issue where Luis extension wouldn't start properly, in PR [#1334](https://github.com/Microsoft/BotFramework-Emulator/pull/1334)
