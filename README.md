# ![Bot Framework Emulator](./docs/media/BotFrameworkEmulator_header.png)

### [Click here to find out what's new with Bot Framework](https://github.com/Microsoft/botframework/blob/master/whats-new.md#whats-new)

# Bot Framework Emulator
[![Build Status](https://fuselabs.visualstudio.com/BotFramework-Emulator/_apis/build/status/%5BV4%20-%20Nightly%5D%20Master%20Build?branchName=master)](https://fuselabs.visualstudio.com/BotFramework-Emulator/_build/latest?definitionId=419&branchName=master) [![Coverage Status](https://coveralls.io/repos/github/Microsoft/BotFramework-Emulator/badge.svg?branch=master)](https://coveralls.io/github/Microsoft/BotFramework-Emulator?branch=master)

The Bot Framework Emulator is a desktop application that allows bot developers to test and debug bots built using the [Bot Framework SDK](https://github.com/microsoft/botbuilder). You can use the Bot Framework Emulator to test bots running either locally on your machine or connect to bots running remotely through a tunnel.

This repo is part the [Microsoft Bot Framework](https://github.com/microsoft/botframework) - a comprehensive framework for building enterprise-grade conversational AI experiences.


## Download

* Download the Bot Framework V4 Emulator for your platform from the [GitHub releases](https://github.com/Microsoft/BotFramework-Emulator/releases/latest) page.

### Supported platforms

* Windows
* OS X
* Linux 

  **Note for Linux users:**

  The Emulator leverages a library that uses `libsecret` so you may need to install it before running `npm install`.

  Depending on your distribution, you will need to run the following command:

  Debian/Ubuntu: `sudo apt-get install libsecret-1-dev`

  Red Hat-based: `sudo yum install libsecret-devel`
  
  Arch Linux: `sudo pacman -S libsecret`

## Documentation

Checkout the [Wiki](https://github.com/Microsoft/BotFramework-Emulator/wiki) for docs.

## Feedback

* File a bug or suggestion in [GitHub Issues](https://github.com/Microsoft/BotFramework-Emulator/blob/v4/CONTRIBUTING.md#submitting-issues)
* Ask a question on [Stack Overflow](https://stackoverflow.com/questions/tagged/botframework)

## Related

* [Microsoft Bot Framework](https://github.com/Microsoft/botframework)
* [Bot Framework SDK](https://github.com/Microsoft/BotBuilder)
* [Bot Framework Tools](https://github.com/Microsoft/BotBuilder-Tools)
* [Bot Framework Web Chat](https://github.com/Microsoft/BotFramework-WebChat)

## Nightly builds

Nightly builds are generated using the latest code. Therefore, they may not be stable, and most likely lack up to date documentation. These builds are better suited for more experienced users, although everyone is welcome to use them and provide feedback. Nightly builds of the V4 Emulator are available [here](https://github.com/Microsoft/botframework-emulator-nightlies/releases).

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Reporting Security Issues
Security issues and bugs should be reported privately, via email, to the Microsoft Security Response Center (MSRC) at [secure@microsoft.com](mailto:secure@microsoft.com). You should receive a response within 24 hours. If for some reason you do not, please follow up via email to ensure we received your original message. Further information, including the [MSRC PGP](https://technet.microsoft.com/en-us/security/dn606155) key, can be found in the [Security TechCenter](https://technet.microsoft.com/en-us/security/default).

Copyright (c) Microsoft Corporation. All rights reserved.
