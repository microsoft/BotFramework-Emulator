export interface IDialogService {
  showDialog(dialog: JSX.Element): any;
  hideDialog(): any;
  setHost(hostElement: HTMLElement): void;
}
