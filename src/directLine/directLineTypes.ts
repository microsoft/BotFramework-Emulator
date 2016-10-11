export interface IPersistentDirectLineSettings {
    port: number;
}
export interface IDirectLineState extends IPersistentDirectLineSettings {
}
export const directLineDefault: IDirectLineState = {
    port: 9001
}
