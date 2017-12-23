const API_BASE_URL = '/bam/';

export function ping() {
    return `${ API_BASE_URL }ping`;
}
