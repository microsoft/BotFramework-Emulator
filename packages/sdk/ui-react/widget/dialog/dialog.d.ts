/// <reference types="react" />
export interface ModalProps extends JSX.ElementChildrenAttribute {
    cancel: (event: any) => void;
    title?: string;
    detailedDescription?: string;
    maxWidth?: number;
    className?: string;
}
export declare function Dialog(props: ModalProps): JSX.Element;
