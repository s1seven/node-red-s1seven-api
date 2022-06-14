const URL_TO_ENV_MAP = {
    development: 'https://app.s1seven.ovh',
    staging: 'https://app.s1seven.dev',
    // production: 'https://app.s1seven.com',
};
const ALGORITHM_OPTIONS = ['sha256', 'sha512', 'sha3-256', 'sha3-384', 'sha3-512'];
const ENCODING_OPTIONS = ['base64', 'hex'];
const MODE = ['test', 'live'];
const COIN_TYPES = [822, 100000000];
const IDENTITY_STATUS = ['valid', 'obsolete'];

module.exports = {
    ALGORITHM_OPTIONS,
    URL_TO_ENV_MAP,
    ENCODING_OPTIONS,
    MODE,
    COIN_TYPES,
    IDENTITY_STATUS,
};
