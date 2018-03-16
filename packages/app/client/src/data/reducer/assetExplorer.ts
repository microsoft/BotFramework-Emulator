//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

export interface IAssetExplorerState {
  files?: { [fileName: string]: { size: number } };
  folder?: string;
}

type AssetExplorerAction = any;

const DEFAULT_STATE: IAssetExplorerState = {
  files: {
    '.gitignore': { size: 341 },
    'gulpfile.js': { size: 1392 },
    'package-lock.json': { size: 450173 },
    'package.json': { size: 1328 },
    'tsconfig.json': { size: 745 },
    'tsconfig.test.json': { size: 87 },
    'tslint.json': { size: 3059 },
    'packages/react-dev-utils-4.2.1@ed5c48c.tgz': { size: 23417 },
    'packages/react-scripts-ts-2.9.0@e404a66.tgz': { size: 67443 },
    'public/index.html': { size: 3105 },
    'public/manifest.json': { size: 305 },
    'public/css/emulator.css': { size: 25694 },
    'public/css/splitter.css': { size: 991 },
    'public/external/css/botchat.css': { size: 20688 },
    'public/external/vs/loader.js': { size: 28899 },
    'public/external/vs/base/worker/workerMain.js': { size: 151535 },
    'public/external/vs/basic-languages/src/bat.js': { size: 2106 },
    'public/external/vs/basic-languages/src/coffee.js': { size: 3880 },
    'public/external/vs/basic-languages/src/cpp.js': { size: 4692 },
    'public/external/vs/basic-languages/src/csharp.js': { size: 4825 },
    'public/external/vs/basic-languages/src/css.js': { size: 4729 },
    'public/external/vs/basic-languages/src/dockerfile.js': { size: 2366 },
    'public/external/vs/basic-languages/src/fsharp.js': { size: 3148 },
    'public/external/vs/basic-languages/src/go.js': { size: 3036 },
    'public/external/vs/basic-languages/src/handlebars.js': { size: 6521 },
    'public/external/vs/basic-languages/src/html.js': { size: 4800 },
    'public/external/vs/basic-languages/src/ini.js': { size: 1481 },
    'public/external/vs/basic-languages/src/java.js': { size: 3188 },
    'public/external/vs/basic-languages/src/less.js': { size: 4137 },
    'public/external/vs/basic-languages/src/lua.js': { size: 2503 },
    'public/external/vs/basic-languages/src/markdown.js': { size: 3577 },
    'public/external/vs/basic-languages/src/msdax.js': { size: 5294 },
    'public/external/vs/basic-languages/src/objective-c.js': { size: 2786 },
    'public/external/vs/basic-languages/src/php.js': { size: 8310 },
    'public/external/vs/basic-languages/src/postiats.js': { size: 8241 },
    'public/external/vs/basic-languages/src/powershell.js': { size: 3563 },
    'public/external/vs/basic-languages/src/pug.js': { size: 5187 },
    'public/external/vs/basic-languages/src/python.js': { size: 3301 },
    'public/external/vs/basic-languages/src/r.js': { size: 3213 },
    'public/external/vs/basic-languages/src/razor.js': { size: 8836 },
    'public/external/vs/basic-languages/src/ruby.js': { size: 8501 },
    'public/external/vs/basic-languages/src/sb.js': { size: 2208 },
    'public/external/vs/basic-languages/src/scss.js': { size: 6650 },
    'public/external/vs/basic-languages/src/solidity.js': { size: 18968 },
    'public/external/vs/basic-languages/src/sql.js': { size: 18619 },
    'public/external/vs/basic-languages/src/swift.js': { size: 4507 },
    'public/external/vs/basic-languages/src/vb.js': { size: 5983 },
    'public/external/vs/basic-languages/src/xml.js': { size: 2119 },
    'public/external/vs/basic-languages/src/yaml.js': { size: 3869 },
    'public/external/vs/editor/editor.main.css': { size: 172199 },
    'public/external/vs/editor/editor.main.js': { size: 1824086 },
    'public/external/vs/editor/editor.main.nls.de.js': { size: 28053 },
    'public/external/vs/editor/editor.main.nls.es.js': { size: 28955 },
    'public/external/vs/editor/editor.main.nls.fr.js': { size: 31173 },
    'public/external/vs/editor/editor.main.nls.hu.js': { size: 31075 },
    'public/external/vs/editor/editor.main.nls.it.js': { size: 30032 },
    'public/external/vs/editor/editor.main.nls.ja.js': { size: 31751 },
    'public/external/vs/editor/editor.main.nls.js': { size: 24260 },
    'public/external/vs/editor/editor.main.nls.ko.js': { size: 28582 },
    'public/external/vs/editor/editor.main.nls.pt-br.js': { size: 27778 },
    'public/external/vs/editor/editor.main.nls.ru.js': { size: 43958 },
    'public/external/vs/editor/editor.main.nls.tr.js': { size: 27985 },
    'public/external/vs/editor/editor.main.nls.zh-cn.js': { size: 22593 },
    'public/external/vs/editor/editor.main.nls.zh-tw.js': { size: 23059 },
    'public/external/vs/editor/contrib/suggest/browser/media/String_16x.svg': { size: 4740 },
    'public/external/vs/editor/contrib/suggest/browser/media/String_inverse_16x.svg': { size: 4740 },
    'public/external/vs/editor/standalone/browser/quickOpen/symbol-sprite.svg': { size: 20729 },
    'public/external/vs/language/css/cssMode.js': { size: 20983 },
    'public/external/vs/language/css/cssWorker.js': { size: 477063 },
    'public/external/vs/language/html/htmlMode.js': { size: 19310 },
    'public/external/vs/language/html/htmlWorker.js': { size: 113392 },
    'public/external/vs/language/json/jsonMode.js': { size: 36549 },
    'public/external/vs/language/json/jsonWorker.js': { size: 93035 },
    'public/external/vs/language/typescript/lib/typescriptServices.js': { size: 1486642 },
    'public/external/vs/language/typescript/src/mode.js': { size: 20545 },
    'public/external/vs/language/typescript/src/worker.js': { size: 1552105 },
    'src/constants.js': { size: 1845 },
    'src/index.tsx': { size: 2259 },
    'src/interceptError.ts': { size: 1863 },
    'src/interceptHyperlink.ts': { size: 1975 },
    'src/registerServiceWorker.ts': { size: 4794 },
    'src/setupContextMenu.ts': { size: 3090 },
    'src/utils.js': { size: 1479 },
    'src/data/debugWebSocketConnection.js': { size: 2358 },
    'src/data/store.js': { size: 2593 },
    'src/data/action/assetExplorerActions.js': { size: 2580 },
    'src/data/action/botActions.js': { size: 1703 },
    'src/data/action/cardActions.js': { size: 1938 },
    'src/data/action/conversationActions.js': { size: 1624 },
    'src/data/action/editorActions.js': { size: 1766 },
    'src/data/action/navBarActions.js': { size: 1608 },
    'src/data/action/serverActions.js': { size: 1567 },
    'src/data/reducer/assetExplorer.js': { size: 12472 },
    'src/data/reducer/bot.js': { size: 2074 },
    'src/data/reducer/card.js': { size: 4839 },
    'src/data/reducer/conversation.js': { size: 2030 },
    'src/data/reducer/editor.js': { size: 2464 },
    'src/data/reducer/navBar.js': { size: 2036 },
    'src/data/reducer/server.js': { size: 1962 },
    'src/external/custom-botframework-webchat/CognitiveServices.js': { size: 89110 },
    'src/external/shared/activityVisitor.ts': { size: 4615 },
    'src/external/shared/globals.ts': { size: 2282 },
    'src/external/shared/paymentEncoder.ts': { size: 2160 },
    'src/external/shared/utils.ts': { size: 5863 },
    'src/external/types/accountTypes.ts': { size: 1562 },
    'src/external/types/activityTypes.ts': { size: 3699 },
    'src/external/types/attachmentTypes.ts': { size: 7159 },
    'src/external/types/botTypes.ts': { size: 1843 },
    'src/external/types/commandLineArgsTypes.ts': { size: 1463 },
    'src/external/types/conversationTypes.ts': { size: 1596 },
    'src/external/types/entityTypes.ts': { size: 1447 },
    'src/external/types/eTagTypes.ts': { size: 1451 },
    'src/external/types/paymentTypes.ts': { size: 3900 },
    'src/external/types/responseTypes.ts': { size: 3633 },
    'src/external/types/serverSettingsTypes.ts': { size: 3693 },
    'src/external/types/speechTypes.ts': { size: 1511 },
    'src/external/types/userTypes.ts': { size: 1459 },
    'src/integration/fetchJSON.js': { size: 1829 },
    'src/integration/urls.js': { size: 1492 },
    'src/ui/editor/index.js': { size: 2503 },
    'src/ui/editor/panel.js': { size: 2673 },
    'src/ui/editor/testBedEditor.js': { size: 2776 },
    'src/ui/editor/botChatEditor/chatPanel.js': { size: 2117 },
    'src/ui/editor/botChatEditor/detailPanel.js': { size: 2060 },
    'src/ui/editor/botChatEditor/index.js': { size: 2282 },
    'src/ui/editor/botChatEditor/logPanel.js': { size: 2319 },
    'src/ui/editor/cardEditor/index.js': { size: 3912 },
    'src/ui/editor/cardEditor/cardJsonEditor/index.js': { size: 8586 },
    'src/ui/editor/cardEditor/cardOutput/index.js': { size: 3583 },
    'src/ui/editor/cardEditor/cardOutputMessage/index.js': { size: 2009 },
    'src/ui/editor/cardEditor/cardPreview/index.js': { size: 5614 },
    'src/ui/editor/cardEditor/cardTemplateRow/index.js': { size: 1836 },
    'src/ui/editor/cardEditor/cardTemplator/index.js': { size: 2763 },
    'src/ui/experimental/actionDropdown.js': { size: 2320 },
    'src/ui/experimental/actionTextBox.js': { size: 2226 },
    'src/ui/layout/expandCollapse.js': { size: 3317 },
    'src/ui/layout/labelling.js': { size: 1669 },
    'src/ui/layout/sideBySide.js': { size: 1793 },
    'src/ui/layout/splitter/index.js': { size: 8366 },
    'src/ui/layout/splitter/pane.js': { size: 1124 },
    'src/ui/shell/main.js': { size: 2675 },
    'src/ui/shell/explorer/assetExplorerSet.js': { size: 2500 },
    'src/ui/shell/explorer/botExplorer.js': { size: 3900 },
    'src/ui/shell/explorer/cardExplorer.js': { size: 3099 },
    'src/ui/shell/explorer/conversationExplorer.js': { size: 4050 },
    'src/ui/shell/explorer/emulatorExplorerSet.js': { size: 1610 },
    'src/ui/shell/explorer/explorerSet.js': { size: 2476 },
    'src/ui/shell/explorer/folderNotOpenExplorer.js': { size: 3001 },
    'src/ui/shell/explorer/formExplorer.js': { size: 2385 },
    'src/ui/shell/explorer/index.js': { size: 2121 },
    'src/ui/shell/explorer/luisExplorer.js': { size: 2387 },
    'src/ui/shell/explorer/qnaExplorer.js': { size: 2368 },
    'src/ui/shell/mdi/botTab.js': { size: 180 },
    'src/ui/shell/mdi/cardTab.js': { size: 182 },
    'src/ui/shell/mdi/conversationTab.js': { size: 369 },
    'src/ui/shell/mdi/index.js': { size: 1787 },
    'src/ui/shell/mdi/tabFactory.js': { size: 749 },
    'src/ui/shell/mdi/testBedTab.js': { size: 183 },
    'src/ui/shell/multiTabs/index.js': { size: 2949 },
    'src/ui/shell/multiTabs/tabBar.js': { size: 2060 },
    'src/ui/shell/multiTabs/tabBarTab.js': { size: 1663 },
    'src/ui/shell/multiTabs/tabbedDocument.js': { size: 1838 },
    'src/ui/shell/navBar/button.js': { size: 1739 },
    'src/ui/shell/navBar/index.js': { size: 2913 },
    'src/ui/widget/connectivityBadge.js': { size: 3087 },
    'src/ui/widget/treeView.js': { size: 1890 },
    'src/v1/botEmulatorContext.ts': { size: 4448 },
    'src/v1/constants.ts': { size: 12005 },
    'src/v1/emulator.ts': { size: 7907 },
    'src/v1/hyperlinkHandler.ts': { size: 5096 },
    'src/v1/inspectorView.tsx': { size: 4057 },
    'src/v1/log.ts': { size: 2130 },
    'src/v1/logView.tsx': { size: 7530 },
    'src/v1/mainView.tsx': { size: 16212 },
    'src/v1/reducers.ts': { size: 14840 },
    'src/v1/settings.ts': { size: 9433 },
    'src/v1/splash.html': { size: 6720 },
    'src/v1/addressBar/addressBar.tsx': { size: 4157 },
    'src/v1/addressBar/addressBarBotCreds.tsx': { size: 5656 },
    'src/v1/addressBar/addressBarMenu.tsx': { size: 9436 },
    'src/v1/addressBar/addressBarOperators.ts': { size: 5648 },
    'src/v1/addressBar/addressBarRefresh.tsx': { size: 2497 },
    'src/v1/addressBar/addressBarSearch.tsx': { size: 4324 },
    'src/v1/addressBar/addressBarStatus.tsx': { size: 1637 },
    'src/v1/addressBar/addressBarTextBox.tsx': { size: 4980 },
    'src/v1/dialogs/appSettingsDialog.tsx': { size: 11765 },
    'src/v1/dialogs/commonDialog.tsx': { size: 3061 },
    'src/v1/payments/addCreditCardView.tsx': { size: 8249 },
    'src/v1/payments/addShippingAddressView.tsx': { size: 7206 },
    'src/v1/payments/button.tsx': { size: 2177 },
    'src/v1/payments/checkoutSettings.tsx': { size: 3645 },
    'src/v1/payments/checkoutTypes.tsx': { size: 3498 },
    'src/v1/payments/checkoutView.tsx': { size: 22378 },
    'src/v1/payments/index.html': { size: 459 },
    'src/v1/payments/index.tsx': { size: 4016 },
    'src/v1/payments/paymentDetails.tsx': { size: 3563 },
    'src/v1/payments/selectCreditCard.tsx': { size: 2058 },
    'src/v1/payments/selectorComponent.tsx': { size: 6428 },
    'src/v1/payments/selectShippingAddress.tsx': { size: 2463 },
    'src/v1/payments/selectShippingMethod.tsx': { size: 2011 }
  },
  folder: null
};

export default function assetExplorer(state: IAssetExplorerState = DEFAULT_STATE, action: AssetExplorerAction): IAssetExplorerState {
  switch (action.type) {
    default: break;
  }

  return state;
}
