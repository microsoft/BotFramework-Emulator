export default function fetchJSON(url, options = {}) {
    const headers = { ...options.headers };

    headers['Content-Type'] = 'application/json';

    return fetch(url, options).then(res => {
        const statusFamily = ~~(res.status / 100);

        if (statusFamily === 2) {
            return res.json();
        } else {
            return Promise.reject(new Error(`Server returned ${ res.status }`));
        }
    });
}
