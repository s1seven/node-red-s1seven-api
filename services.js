const axios = require('axios');
const { BASE_URL } = require('./constants');

async function getHashOfCertificate(certificate, accessToken) {
    try {
        const response = await axios
            .post(
                `${BASE_URL}/api/certificates/hash`,
                {
                    algorithm: 'sha256', // allow these to be configured
                    encoding: 'hex',
                    source: certificate, // try uploading cert in swagger ui
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                },
            );
        return response;
    } catch (error) {
        return error;
    }
}

async function notarizeCertificate(certificate, accessToken, mode, company, identity) {
    try {
        const response = await axios
            .post(
                `${BASE_URL}/api/certificates/notarize/notarize?identity=${identity}&mode=${ mode ? mode : 'test' }`,
                certificate,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        company: company
                    },
                },
            );
        return response;
    } catch (error) {
        return error;
    }
}

async function verifyCertificate(certificate, mode) {
    try {
        const response = await axios
            .post(
                `${BASE_URL}/api/certificates/verify/?mode=${ mode ? mode : 'test' }`, 
                certificate,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        return response;
    } catch (error) {
        return error;
    }
}

module.exports = {
    getHashOfCertificate,
    notarizeCertificate,
    verifyCertificate
}
