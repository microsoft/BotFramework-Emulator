import { uniqueId } from '../utils';


export interface IBot {
    botId?: string,
    botUrl?: string,
    msaAppId?: string,
    msaPassword?: string
}

export const newBot = (bot: IBot): IBot => {
    return Object.assign(
        {},
        {
            botUrl: '',
            msaAppId: '',
            msaPassword: ''
        },
        bot,
        {
            botId: uniqueId()
        }
    ) as IBot;
}
