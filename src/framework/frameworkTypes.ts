export interface IPersistentFrameworkSettings {
    port: number;
}
export interface IFrameworkState extends IPersistentFrameworkSettings {
}
export const frameworkDefault: IFrameworkState = {
    port: 9002
}
