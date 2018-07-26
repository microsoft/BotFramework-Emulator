var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ActiveBotHelper } from './activeBotHelper';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { hasNonGlobalTabs } from '../../data/editorHelpers';
import store from '../../data/store';
import { getActiveBot } from '../../data/botHelpers';
import { ServiceType } from 'msbot/bin/schema';
import { SharedConstants } from '@bfemulator/app-shared';
describe('ActiveBotHelper tests', () => {
    let backupCommandServiceImpl;
    let backupHasNonGlobalTabs;
    let backupStore;
    let backupGetActiveBot;
    let preserveImports = () => {
        backupCommandServiceImpl = CommandServiceImpl;
        backupHasNonGlobalTabs = hasNonGlobalTabs;
        backupStore = store;
        backupGetActiveBot = getActiveBot;
    };
    let restoreImports = () => {
        CommandServiceImpl = backupCommandServiceImpl;
        hasNonGlobalTabs = backupHasNonGlobalTabs;
        store = backupStore;
        getActiveBot = backupGetActiveBot;
    };
    beforeEach(preserveImports);
    afterEach(restoreImports);
    it('confirmSwitchBot() functionality', () => __awaiter(this, void 0, void 0, function* () {
        hasNonGlobalTabs = jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false);
        CommandServiceImpl = ({ remoteCall: jest.fn().mockResolvedValue('done') });
        const result1 = yield ActiveBotHelper.confirmSwitchBot();
        expect(result1).toBe('done');
        const result2 = yield ActiveBotHelper.confirmSwitchBot();
        expect(result2).toBe(true);
    }));
    it('confirmCloseBot() functionality', () => __awaiter(this, void 0, void 0, function* () {
        hasNonGlobalTabs = jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false);
        CommandServiceImpl = ({ remoteCall: jest.fn().mockResolvedValue('done') });
        const result1 = yield ActiveBotHelper.confirmCloseBot();
        expect(result1).toBe('done');
        const result2 = yield ActiveBotHelper.confirmCloseBot();
        expect(result2).toBe(true);
    }));
    it('closeActiveBot() functionality', () => __awaiter(this, void 0, void 0, function* () {
        const mockRemoteCall1 = jest.fn().mockResolvedValue(true);
        CommandServiceImpl = ({ remoteCall: mockRemoteCall1 });
        store = ({ dispatch: () => null });
        yield ActiveBotHelper.closeActiveBot();
        expect(mockRemoteCall1).toHaveBeenCalledTimes(2);
        const mockRemoteCall2 = jest.fn().mockRejectedValue('err');
        CommandServiceImpl = ({ remoteCall: mockRemoteCall2 });
        expect(ActiveBotHelper.closeActiveBot()).rejects.toEqual(new Error('Error while closing active bot: err'));
    }));
    it('botAlreadyOpen() functionality', () => __awaiter(this, void 0, void 0, function* () {
        const mockRemoteCall = jest.fn().mockResolvedValue(true);
        CommandServiceImpl = ({ remoteCall: mockRemoteCall });
        yield ActiveBotHelper.botAlreadyOpen();
        expect(mockRemoteCall).toHaveBeenCalledTimes(1);
    }));
    it('browseForBotFile() functionality', () => __awaiter(this, void 0, void 0, function* () {
        const mockRemoteCall = jest.fn().mockResolvedValue(true);
        CommandServiceImpl = ({ remoteCall: mockRemoteCall });
        yield ActiveBotHelper.browseForBotFile();
        expect(mockRemoteCall).toHaveBeenCalledTimes(1);
    }));
    it('confirmAndCloseBot() functionality', () => __awaiter(this, void 0, void 0, function* () {
        let backupConfirmCloseBot = ActiveBotHelper.confirmCloseBot;
        let backupCloseActiveBot = ActiveBotHelper.closeActiveBot;
        getActiveBot = jest.fn().mockReturnValueOnce(null).mockReturnValue({});
        ActiveBotHelper.confirmCloseBot = jest.fn().mockResolvedValue({});
        ActiveBotHelper.closeActiveBot = jest.fn().mockResolvedValue(null);
        // test short-circuit if no active bot
        yield ActiveBotHelper.confirmAndCloseBot();
        expect(ActiveBotHelper.confirmCloseBot).not.toBeCalled();
        yield ActiveBotHelper.confirmAndCloseBot();
        expect(ActiveBotHelper.confirmCloseBot).toHaveBeenCalled();
        expect(ActiveBotHelper.closeActiveBot).toHaveBeenCalled();
        // test catch on promise
        ActiveBotHelper.confirmCloseBot = jest.fn().mockRejectedValue('err');
        expect(ActiveBotHelper.confirmAndCloseBot()).rejects.toEqual(new Error('Error while closing active bot: err'));
        ActiveBotHelper.confirmCloseBot = backupConfirmCloseBot;
        ActiveBotHelper.closeActiveBot = backupCloseActiveBot;
    }));
    it('setActiveBot() functionality', () => __awaiter(this, void 0, void 0, function* () {
        const bot = {
            name: 'someBot',
            description: '',
            path: 'somePath',
            secretKey: null,
            services: []
        };
        const mockDispatch = jest.fn((...args) => null);
        store = ({ dispatch: mockDispatch });
        let mockRemoteCall = jest.fn().mockResolvedValue({});
        CommandServiceImpl = ({ remoteCall: mockRemoteCall });
        yield ActiveBotHelper.setActiveBot(bot);
        expect(mockDispatch).toHaveBeenCalledTimes(2);
        expect(mockRemoteCall).toHaveBeenCalledTimes(3);
        expect(mockRemoteCall).toHaveBeenCalledWith(SharedConstants.Commands.Bot.SetActive, bot);
        mockRemoteCall = jest.fn().mockRejectedValueOnce('error');
        CommandServiceImpl = ({ remoteCall: mockRemoteCall });
        expect(ActiveBotHelper.setActiveBot(bot)).rejects.toEqual(new Error('Error while setting active bot: error'));
    }));
    it('confirmAndCreateBot() functionality', () => __awaiter(this, void 0, void 0, function* () {
        const backupConfirmSwitchBot = ActiveBotHelper.confirmSwitchBot;
        ActiveBotHelper.confirmSwitchBot = () => new Promise((resolve, reject) => resolve(true));
        const backupSetActiveBot = ActiveBotHelper.setActiveBot;
        ActiveBotHelper.setActiveBot = (activeBot) => new Promise((resolve, reject) => resolve());
        const mockDispatch = jest.fn().mockReturnValue(null);
        store = ({ dispatch: mockDispatch });
        const endpoint = {
            appId: 'someAppId',
            appPassword: '',
            type: ServiceType.Endpoint,
            endpoint: 'someEndpoint',
            id: 'someEndpoint',
            name: 'myEndpoint'
        };
        const bot = {
            name: 'someBot',
            description: '',
            secretKey: null,
            path: 'somePath',
            services: [endpoint]
        };
        let mockRemoteCall = jest.fn().mockResolvedValue(bot);
        const mockCall = jest.fn().mockResolvedValue(null);
        CommandServiceImpl = ({ remoteCall: mockRemoteCall, call: mockCall });
        yield ActiveBotHelper.confirmAndCreateBot(bot, 'someSecret');
        expect(mockDispatch).toHaveBeenCalledTimes(4);
        expect(mockCall).toHaveBeenCalledWith(SharedConstants.Commands.Emulator.NewLiveChat, endpoint);
        expect(mockRemoteCall).toHaveBeenCalledWith(SharedConstants.Commands.Bot.Create, bot, 'someSecret');
        mockRemoteCall = jest.fn().mockRejectedValue('err');
        CommandServiceImpl = ({ remoteCall: mockRemoteCall, call: mockCall });
        expect(ActiveBotHelper.confirmAndCreateBot(bot, 'someSecret'))
            .rejects.toEqual(new Error('Error during bot create: err'));
        ActiveBotHelper.confirmSwitchBot = backupConfirmSwitchBot;
        ActiveBotHelper.setActiveBot = backupSetActiveBot;
    }));
    it('confirmAndOpenBotFromFile() functionality', () => __awaiter(this, void 0, void 0, function* () {
        const backupBrowseForBotFile = ActiveBotHelper.browseForBotFile;
        const backupBotAlreadyOpen = ActiveBotHelper.botAlreadyOpen;
        const backupConfirmSwitchBot = ActiveBotHelper.confirmSwitchBot;
        const bot = {
            name: 'someBot',
            description: '',
            secretKey: null,
            path: 'somePath',
            services: []
        };
        const mockDispatch = jest.fn().mockReturnValue(null);
        store = ({ dispatch: mockDispatch });
        // opening a bot that's already open
        ActiveBotHelper.browseForBotFile = () => new Promise((resolve, reject) => resolve('somePath'));
        getActiveBot = () => bot;
        ActiveBotHelper.botAlreadyOpen = () => null;
        yield ActiveBotHelper.confirmAndOpenBotFromFile();
        expect(mockDispatch).not.toHaveBeenCalled();
        // opening a bot that isn't already open
        ActiveBotHelper.browseForBotFile = () => new Promise((resolve, reject) => resolve('someOtherPath'));
        ActiveBotHelper.confirmSwitchBot = () => new Promise((resolve, reject) => resolve(true));
        const mockRemoteCall = jest.fn().mockResolvedValueOnce(bot).mockResolvedValue(null);
        const mockCall = jest.fn().mockResolvedValue(null);
        CommandServiceImpl = ({ remoteCall: mockRemoteCall, call: mockCall });
        yield ActiveBotHelper.confirmAndOpenBotFromFile();
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockCall).toHaveBeenCalledWith(SharedConstants.Commands.Bot.Load, bot);
        expect(mockRemoteCall).toHaveBeenCalledWith(SharedConstants.Commands.Bot.Open, 'someOtherPath');
        expect(mockRemoteCall).toHaveBeenCalledWith(SharedConstants.Commands.Bot.SetActive, bot);
        ActiveBotHelper.browseForBotFile = backupBrowseForBotFile;
        ActiveBotHelper.botAlreadyOpen = backupBotAlreadyOpen;
        ActiveBotHelper.confirmSwitchBot = backupConfirmSwitchBot;
    }));
    it('confirmAndSwitchBots() functionality', () => __awaiter(this, void 0, void 0, function* () {
        const backupBotAlreadyOpen = ActiveBotHelper.botAlreadyOpen;
        const backupConfirmSwitchBot = ActiveBotHelper.confirmSwitchBot;
        const backupSetActiveBot = ActiveBotHelper.setActiveBot;
        const endpoint = {
            appId: 'someAppId',
            appPassword: '',
            type: ServiceType.Endpoint,
            endpoint: 'someEndpoint',
            id: 'someEndpoint',
            name: 'myEndpoint'
        };
        const bot = {
            name: 'someBot',
            description: '',
            secretKey: null,
            path: 'somePath',
            services: [endpoint]
        };
        const otherBot = Object.assign({}, bot, { path: 'someOtherPath' });
        const mockDispatch = jest.fn(() => null);
        store = ({ dispatch: mockDispatch });
        // switching to a bot that's already open
        getActiveBot = () => bot;
        ActiveBotHelper.botAlreadyOpen = () => new Promise((resolve, reject) => resolve(null));
        yield ActiveBotHelper.confirmAndSwitchBots(bot);
        expect(mockDispatch).not.toHaveBeenCalled();
        // switching to a bot that's not open with an endpoint
        getActiveBot = () => otherBot;
        const mockRemoteCall = jest.fn().mockResolvedValue(bot);
        const mockCall = jest.fn().mockResolvedValue(null);
        CommandServiceImpl = ({ call: mockCall, remoteCall: mockRemoteCall });
        ActiveBotHelper.confirmSwitchBot = () => new Promise((resolve, reject) => resolve(true));
        ActiveBotHelper.setActiveBot = (arg) => new Promise((resolve, reject) => resolve(null));
        yield ActiveBotHelper.confirmAndSwitchBots(bot);
        expect(mockCall).toHaveBeenCalledWith(SharedConstants.Commands.Emulator.NewLiveChat, endpoint);
        expect(mockDispatch).toHaveBeenCalledTimes(3);
        mockDispatch.mockClear();
        mockCall.mockClear();
        // switching to a bot with only the bot path available
        yield ActiveBotHelper.confirmAndSwitchBots('someBotPath');
        expect(mockRemoteCall).toHaveBeenCalledWith(SharedConstants.Commands.Bot.Open, 'someBotPath');
        mockCall.mockClear();
        mockDispatch.mockClear();
        // switching to a bot with an endpoint with endpoint overrides
        bot.overrides = {
            endpoint: {
                endpoint: 'someOverride'
            }
        };
        yield ActiveBotHelper.confirmAndSwitchBots(bot);
        expect(mockCall).toHaveBeenCalledWith(SharedConstants.Commands.Emulator.NewLiveChat, Object.assign({}, endpoint, { endpoint: 'someOverride' }));
        mockCall.mockClear();
        // switching to a bot with multiple endpoints, with endpoint overrides including an endpoint id
        const secondEndpoint = Object.assign({}, endpoint, { id: 'someOtherEndpoint' });
        bot.services.push(secondEndpoint);
        bot.overrides = {
            endpoint: {
                endpoint: 'someOtherOverride',
                id: 'someOtherEndpoint'
            }
        };
        yield ActiveBotHelper.confirmAndSwitchBots(bot);
        expect(mockCall).toHaveBeenCalledWith(SharedConstants.Commands.Emulator.NewLiveChat, Object.assign({}, secondEndpoint, { endpoint: 'someOtherOverride' }));
        ActiveBotHelper.botAlreadyOpen = backupBotAlreadyOpen;
        ActiveBotHelper.confirmSwitchBot = backupConfirmSwitchBot;
        ActiveBotHelper.setActiveBot = backupSetActiveBot;
    }));
});
//# sourceMappingURL=activeBotHelper.spec.js.map