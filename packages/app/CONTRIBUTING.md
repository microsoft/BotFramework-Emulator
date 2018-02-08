# Contributing

There are many ways to contribute to the Bot Framework Emulator project: reporting issues, submitting pull requests, and creating suggestions.

## Submitting Issues

The Bot Framework Emulator project tracks issues and feature requests using [GitHub issue tracker](https://github.com/BotBuilder-Emulator/issues).

### Before Submitting an Issue

First, please do a search in open issues to see if the issue or feature request has already been filed. If there is an existing issue, add your comments to that issue.

If your issue is a question, consider asking it on Stack Overflow using the tag `botbuilder`.

### Writing Great Issues and Suggestions
* Provide reproducible steps, what the result of the steps was, and what you would have expected to happen.
* Always file a single bug or feature request per issue. Do not list multiple bugs or requests in the same issue.
* Do not add your issue as a comment to an existing issue unless it's for the identical input. Many issues look similar, but have different causes.
* Include a screenshot or animated GIF.

Don't feel bad if we can't reproduce the issue and ask you for more information!

## Build and Run from Source

### Prerequisites
Bot Framework Emulator development requires that you install [git](https://git-scm.com) and [Node.JS](https://nodejs.org/).

### Clone and Build
Clone the repo
```
git clone https://github.com/Microsoft/BotFramework-Emulator.git
cd BotFramework-Emulator
```

Install Node packages
```
npm install
```

Build
```
npm run build
```

Run
```
npm run start
```

**Development in Visual Studio Code**

With the project open in VSCode:

* `Ctrl+Shift+B`: build the project
* `F5`: debug the project

### Debugging
The Bot Framework Emulator has a multi-process architecture, meaning different parts of the app run in different processes.

These instructions are in some cases specific to [Visual Studio Code](https://code.visualstudio.com).

**Render Process**

When you build and run the application locally, the Chrome Developer Tools are available in the app. They can be accessed by pressing `Ctrl+Shift+I`. Render process code can be debugged from within this tool.

TODO: Document debugging of render process using VSCode & the [Debugger for Chrome](https://marketplace.visualstudio.com/items/msjsdiag.debugger-for-chrome) extension.

**Main Process**

This is a NodeJS process, and can be debugged directly from VSCode. With the project open in VSCode, press `F5` to start the application and attach to the Node debugging facility.

## Pull Requests

Before we can accept a pull request from you, you must agree to the [Contributor License Agreement (CLA)](https://github.com/Microsoft/BotFramework-Emulator/wiki/Contributor-License-Agreement). It is an automated process and you only need to do this once.

To enable us to quickly review and accept your pull requests, always create one pull request per issue and link the issue in the pull request. Never merge multiple requests in one unless they have the same root cause. Keep code changes as small as possible. Avoid pure formatting changes to code that has not been modified otherwise.
