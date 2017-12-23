import { navigate } from './v1/hyperlinkHandler';

export default function interceptHyperlink() {
    const interceptClickEvent = (e: Event) => {
        let target: any = e.target;

        while (target) {
            if (target.href) {
                e.preventDefault();
                navigate(target.href);
                return;
            }

            target = target.parentNode;
        }
    }

    document.addEventListener('click', interceptClickEvent);

    // Monkey patch window.open
    window.open = (url: string): any => {
        navigate(url);
    }
}
