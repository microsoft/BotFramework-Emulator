# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased
## Fixed
- [client] Added an empty state for the recent bots submenu in the app menu for Windows in PR [1945](https://github.com/microsoft/BotFramework-Emulator/pull/1945)
- [client] Fixed a bug that was showing the custom user ID validation message when disabled in PR [1946](https://github.com/microsoft/BotFramework-Emulator/pull/1946)
- [client] Improved error logging when opening a bot via URL in debug mode in PR [1949](https://github.com/microsoft/BotFramework-Emulator/pull/1949)
- [client] Fixed various accessibility issues in PRs:
  - [1970](https://github.com/microsoft/BotFramework-Emulator/pull/1970)
  - [1982](https://github.com/microsoft/BotFramework-Emulator/pull/1982)
  - [1983](https://github.com/microsoft/BotFramework-Emulator/pull/1983)
  - [1990](https://github.com/microsoft/BotFramework-Emulator/pull/1990)
  - [1992](https://github.com/microsoft/BotFramework-Emulator/pull/1992)
  - [1993](https://github.com/microsoft/BotFramework-Emulator/pull/1993)

## Removed
- [main] Removed unused `VersionManager` class in PR [1991](https://github.com/microsoft/BotFramework-Emulator/pull/1991)

- [main] Rewrote the `emulator/core` package and removed the `emulator/cli` package in PR [1989](https://github.com/microsoft/BotFramework-Emulator/pull/1989)

## v4.6.0 - 2019 - 10 - 31
## Added
- [main] Added End-to-End tests using Spectron in PR [1696](https://github.com/microsoft/BotFramework-Emulator/pull/1696)
- [main] New Conversation: send a single conversation update activity including bot and user as members added [1709](https://github.com/microsoft/BotFramework-Emulator/pull/1709)
- [app] Consolidated application state store and removed the need for explicit state synchronization between the main and renderer processes in PR [1721](https://github.com/microsoft/BotFramework-Emulator/pull/1721)
- [main] Added logging to OAuth signin link generation flow in PR [1745](https://github.com/microsoft/BotFramework-Emulator/pull/1745)
- [client] Added a context menu item and inspector button to allow copying an activity's JSON in PR [1801](https://github.com/microsoft/BotFramework-Emulator/pull/1801)
- [client/main] Added a new property, `source`, to the `bot_open` telemetry event to distinguish between bots opened via .bot file and via url, in PR [1937](https://github.com/microsoft/BotFramework-Emulator/pull/1937)
- [client] Bumped Web Chat to v4.6.0 in PR [1958](https://github.com/microsoft/BotFramework-Emulator/pull/1958)

## Fixed
- [main] Fixed bug where opening a chat via URL was sending two conversation updates in PR [1735](https://github.com/microsoft/BotFramework-Emulator/pull/1735)
- [main] Fixed an issue where the Emulator was incorrectly sending the conversation id instead of an emulated OAuth token in PR [1738](https://github.com/microsoft/BotFramework-Emulator/pull/1738)
- [client] Fixed an issue with the transcripts path input inside of the resource settings dialog in PR [1836](https://github.com/microsoft/BotFramework-Emulator/pull/1836)
- [client] Fixed various accessibility issues in PRs:
  - [1775](https://github.com/microsoft/BotFramework-Emulator/pull/1775)
  - [1776](https://github.com/microsoft/BotFramework-Emulator/pull/1776)
  - [1780](https://github.com/microsoft/BotFramework-Emulator/pull/1780)
  - [1781](https://github.com/microsoft/BotFramework-Emulator/pull/1781)
  - [1782](https://github.com/microsoft/BotFramework-Emulator/pull/1782)
  - [1783](https://github.com/microsoft/BotFramework-Emulator/pull/1783)
  - [1784](https://github.com/microsoft/BotFramework-Emulator/pull/1784)
  - [1787](https://github.com/microsoft/BotFramework-Emulator/pull/1787)
  - [1790](https://github.com/microsoft/BotFramework-Emulator/pull/1790)
  - [1791](https://github.com/microsoft/BotFramework-Emulator/pull/1791)
  - [1826](https://github.com/microsoft/BotFramework-Emulator/pull/1826)
  - [1827](https://github.com/microsoft/BotFramework-Emulator/pull/1827)
  - [1828](https://github.com/microsoft/BotFramework-Emulator/pull/1828)
  - [1829](https://github.com/microsoft/BotFramework-Emulator/pull/1829)
  - [1831](https://github.com/microsoft/BotFramework-Emulator/pull/1831)
  - [1832](https://github.com/microsoft/BotFramework-Emulator/pull/1832)
  - [1835](https://github.com/microsoft/BotFramework-Emulator/pull/1835)
  - [1836](https://github.com/microsoft/BotFramework-Emulator/pull/1836)
  - [1838](https://github.com/microsoft/BotFramework-Emulator/pull/1838)
  - [1840](https://github.com/microsoft/BotFramework-Emulator/pull/1840)
  - [1841](https://github.com/microsoft/BotFramework-Emulator/pull/1841)
  - [1842](https://github.com/microsoft/BotFramework-Emulator/pull/1842)
  - [1843](https://github.com/microsoft/BotFramework-Emulator/pull/1843)
  - [1844](https://github.com/microsoft/BotFramework-Emulator/pull/1844)
  - [1845](https://github.com/microsoft/BotFramework-Emulator/pull/1845)
  - [1852](https://github.com/microsoft/BotFramework-Emulator/pull/1852)
  - [1855](https://github.com/microsoft/BotFramework-Emulator/pull/1855)
  - [1856](https://github.com/microsoft/BotFramework-Emulator/pull/1856)
  - [1858](https://github.com/microsoft/BotFramework-Emulator/pull/1858)
  - [1859](https://github.com/microsoft/BotFramework-Emulator/pull/1859)
  - [1860](https://github.com/microsoft/BotFramework-Emulator/pull/1860)
  - [1861](https://github.com/microsoft/BotFramework-Emulator/pull/1861)
  - [1862](https://github.com/microsoft/BotFramework-Emulator/pull/1862)
  - [1863](https://github.com/microsoft/BotFramework-Emulator/pull/1863)
  - [1864](https://github.com/microsoft/BotFramework-Emulator/pull/1864)
  - [1865](https://github.com/microsoft/BotFramework-Emulator/pull/1865)
  - [1867](https://github.com/microsoft/BotFramework-Emulator/pull/1867)
  - [1871](https://github.com/microsoft/BotFramework-Emulator/pull/1871)
  - [1872](https://github.com/microsoft/BotFramework-Emulator/pull/1872)
  - [1873](https://github.com/microsoft/BotFramework-Emulator/pull/1873)
  - [1877](https://github.com/microsoft/BotFramework-Emulator/pull/1877)
  - [1879](https://github.com/microsoft/BotFramework-Emulator/pull/1879)
  - [1880](https://github.com/microsoft/BotFramework-Emulator/pull/1880)
  - [1883](https://github.com/microsoft/BotFramework-Emulator/pull/1883)
  - [1893](https://github.com/microsoft/BotFramework-Emulator/pull/1893)
  - [1902](https://github.com/microsoft/BotFramework-Emulator/pull/1902)
  - [1916](https://github.com/microsoft/BotFramework-Emulator/pull/1916)
  - [1917](https://github.com/microsoft/BotFramework-Emulator/pull/1917)
  - [1918](https://github.com/microsoft/BotFramework-Emulator/pull/1918)
  - [1921](https://github.com/microsoft/BotFramework-Emulator/pull/1921)
  - [1923](https://github.com/microsoft/BotFramework-Emulator/pull/1923)
  - [1924](https://github.com/microsoft/BotFramework-Emulator/pull/1924)
  - [1925](https://github.com/microsoft/BotFramework-Emulator/pull/1925)
  - [1927](https://github.com/microsoft/BotFramework-Emulator/pull/1927)
  - [1933](https://github.com/microsoft/BotFramework-Emulator/pull/1933)
  - [1934](https://github.com/microsoft/BotFramework-Emulator/pull/1934)
  - [1935](https://github.com/microsoft/BotFramework-Emulator/pull/1935)
  - [1936](https://github.com/microsoft/BotFramework-Emulator/pull/1936)
 
 - [client] Fixed an issue with the transcripts path input inside of the resource settings dialog in PR [1836](https://github.com/microsoft/BotFramework-Emulator/pull/1836)
 - [client] Implemented HTML app menu for Windows in PR [1893](https://github.com/microsoft/BotFramework-Emulator/pull/1893) 
 - [client/main] Migrated from Bing Speech API to Cognitive Services Speech API in PR [1878](https://github.com/microsoft/BotFramework-Emulator/pull/1878)
 - [client] Fixed issue with certain native browser functions (cut, copy, paste, etc.) firing twice in PR [1920](https://github.com/microsoft/BotFramework-Emulator/pull/1920)
 - [client] Applied theming to InsetShadow component in PR [1922](https://github.com/microsoft/BotFramework-Emulator/pull/1922)
 - [client] Bumped Web Chat to v4.5.3 in PR [1925](https://github.com/microsoft/BotFramework-Emulator/pull/1925)
 - [client] Fixed issue that was causing Web Chat interactions to clear Adaptive Card content in PR [1930](https://github.com/microsoft/BotFramework-Emulator/pull/1930)
 - [client] Bumped `react` & `react-dom` to `^16.8.6` to sync with Web Chat in PR [1939](https://github.com/microsoft/BotFramework-Emulator/pull/1939)
 - [client] Fixed an issue with the `<AutoComplete />` component so that it can now accept an empty string as an input in "controlled mode" in PR [1939](https://github.com/microsoft/BotFramework-Emulator/pull/1939)
 - [tools] Adjusted e2e tests for recent updates to application DOM in PR [1941](https://github.com/microsoft/BotFramework-Emulator/pull/1941)
 - [tools] Made e2e tests more reliable across different machines in PR [1944](https://github.com/microsoft/BotFramework-Emulator/pull/1944)


## v4.5.2 - 2019 - 07 - 17
## Fixed
- [client] Fixed some minor styling issues with the JSON inspector in PR [1691](https://github.com/microsoft/BotFramework-Emulator/pull/1691)
- [client] Fixed issue where html errors were being displayed incorrectly in PR [1687](https://github.com/microsoft/BotFramework-Emulator/pull/1687/files)
- [client] Fixed an issue where webSpeechFactories in store were being set to null in PR [1685](https://github.com/microsoft/BotFramework-Emulator/pull/1685)
- [client] Fixed click handling within all adaptive card inputs (multiline text inputs, input labels, compact choice sets) in PR [1690](https://github.com/microsoft/BotFramework-Emulator/pull/1690)

## v4.5.1 - 2019 - 07 - 13
## Fixed
- [main] Fixed an issue where uploaded attachments weren't being encoded and decoded properly in PR [1678](https://github.com/microsoft/BotFramework-Emulator/pull/1678)
- [client] Fixed issue where adaptive card inputs were being reset when clicking or typing within adaptive card input fields in PR [1681](https://github.com/microsoft/BotFramework-Emulator/pull/1681)

## v4.5.0 - 2019 - 07 - 11
## Added
- [main] Added ability to launch into a bot inspector mode session via protocol url in PR [1617](https://github.com/microsoft/BotFramework-Emulator/pull/1617)
- [main/shared] Added 'Clear State' menu item in PR [1596](https://github.com/microsoft/BotFramework-Emulator/pull/1596)
- [main] Encrypted bot secrets are now stored in the user's OS secret store in PR [1618](https://github.com/microsoft/BotFramework-Emulator/pull/1618)
- [client] Added first-time data collection dialog in PR [1624](https://github.com/microsoft/BotFramework-Emulator/pull/1624)
- [client / main] Re-enabled the ability to collect usage data and telemetry in PR [1644](https://github.com/microsoft/BotFramework-Emulator/pull/1644)
- [client] Added bot state diffing pagination and merged UI into JSON inspector in PR [1658](https://github.com/microsoft/BotFramework-Emulator/pull/1658)

## Fixed 
- [client/main] Auto update is now opt-in by default and changed UX to reflect this in PR [1575](https://github.com/microsoft/BotFramework-Emulator/pull/1575)
- [client/main] Fixed OAuth card sign-in flow when not using magic code in PR [1660](https://github.com/microsoft/BotFramework-Emulator/pull/1660)
- [client/main] Fixed issue where images uploaded from the bot weren't being handled properly in PR [1661](https://github.com/microsoft/BotFramework-Emulator/pull/1661)
- [main] Fixed issue where activities sent from the bot with custom ids were having their ids overwritten in PR [1665](https://github.com/microsoft/BotFramework-Emulator/pull/1665)

## v4.4.2 - 2019 - 05 - 28
## Fixed
- [client] Fixed issue where the slider control was getting stuck when dragging next to a webview element in PR [1546](https://github.com/microsoft/BotFramework-Emulator/pull/1546)
- [client] Fixed issue where selecting an autocomplete result with the mouse was losing focus in PR [1554](https://github.com/microsoft/BotFramework-Emulator/pull/1554)
- [client] Fixed issue where tab icon for sidecar debugging docs page was shrinking in PR [1557](https://github.com/microsoft/BotFramework-Emulator/pull/1557)
- [build] Fixed issue where the NSIS installer was requiring admin permissions to run, causing auto update to fail when attempting to install in PR [1562](https://github.com/microsoft/BotFramework-Emulator/pull/1562)
- [main] Added type 'button' to cancel button #1504 in PR [1551](https://github.com/microsoft/BotFramework-Emulator/pull/1551)
- [luis] Fixed the spinner issue when publishin LUIS after training #1572 in PR [1582](https://github.com/microsoft/BotFramework-Emulator/pull/1582)
- [client / main] Corrected user id logic in PR [1590](https://github.com/microsoft/BotFramework-Emulator/pull/1590)

## v4.4.1 - 2019 - 05 - 06
## Added
- [client] Added auto complete component and mounted in open bot dialog in PR [1510](https://github.com/Microsoft/BotFramework-Emulator/pull/1510)

## Fixed
- [client/main] Show unauthorized signals when connecting to bots with credentials in PR [1522](https://github.com/microsoft/BotFramework-Emulator/pull/1522)
- [main] Bumps `botframework-config` to v4.4.0 to address issues encrypting and decrypting .bot files in PR [1521](https://github.com/microsoft/BotFramework-Emulator/pull/1521)
- [luis] Added ability to scroll within editor section of LUIS inspector and made inspector scrollbars thinner in PR [#1516](https://github.com/Microsoft/BotFramework-Emulator/pull/1516)


## v4.4.0 - 2019 - 05 - 03
## Added
- [client] - Bumped `botframework-webchat` to v4.4.1 in PR [1511](https://github.com/Microsoft/BotFramework-Emulator/pull/1511)
- [client] - Added the ability to toggle into Chromium's Developer Tools via a menu item in PR [1481](https://github.com/Microsoft/BotFramework-Emulator/pull/1481)
- [client] - Added CHANNELS.md for documentation on Bot Inspector mode in PR [1502](https://github.com/Microsoft/BotFramework-Emulator/pull/1502)
- [client/main] Added Bot Inspector mode in PR [1400](https://github.com/Microsoft/BotFramework-Emulator/pull/1400)
- [client] Added the ability to specicy a UserID override in conversations in PR [1456](https://github.com/Microsoft/BotFramework-Emulator/pull/1456)
- [main] Added a splash screen on app startup in PR [1450](https://github.com/Microsoft/BotFramework-Emulator/pull/1451)
- [main] Added npm script to watch and auto-restart the main process in PR [1450](https://github.com/Microsoft/BotFramework-Emulator/pull/1450)
- [main] Added a splash screen to app startup in PR [1451](https://github.com/Microsoft/BotFramework-Emulator/pull/1451)

## Fixed
- [main] Fixed the ability to export transcripts when connected to a bot via URL in PR [1452](https://github.com/Microsoft/BotFramework-Emulator/pull/1452)
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
- [client] Fixed LUIS No Models modal issues #1471 in PR [1484](https://github.com/Microsoft/BotFramework-Emulator/pull/1484)


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
