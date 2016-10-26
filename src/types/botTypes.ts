import { uniqueId } from '../utils';


export interface IBot {
    botId?: string,
    botUrl?: string,
    msaAppId?: string,
    msaPassword?: string,
    serviceUrl?: string,
    saveCreds?: boolean
}

export const newBot = (bot: IBot): IBot => {
    return Object.assign(
        {},
        {
            botUrl: '',
            msaAppId: '',
            msaPassword: '',
            saveCreds: true,
            serviceUrl: 'http://localhost:9002'
        },
        bot,
        {
            botId: uniqueId()
        }
    ) as IBot;
}
