// from the extension to Emulator
export enum EmulatorChannel {
  EnableAccessory = 'enable-accessory',
  Log = 'logger.log',
  LogError = 'logger.error',
  LogLuisDeepLink = 'logger.luis-editor-deep-link',
  SetAccessoryState = 'set-accessory-state',
  SetHightlightedObjects = 'set-highlighted-objects',
  SetInspectorObject = 'set-inspector-object',
  SetInspectorTitle = 'set-inspector-title',
  TrackEvent = 'track-event',
}

// From the Emulator to the extension
export enum ExtensionChannel {
  AccessoryClick = 'accessory-click',
  BotUpdated = 'bot-updated',
  ChatLogUpdated = 'chat-log-updated',
  Inspect = 'inspect',
  Theme = 'theme',
  ToggleDevTools = 'toggle-dev-tools',
}
