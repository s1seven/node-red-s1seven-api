const axios = require('axios');
const { BASE_URL } = require('./constants');

async function getHashOfCertificate(certificate, accessToken) {
    try {
        const response = await axios
            .post(
                `${BASE_URL}/api/certificates/hash`,
                {
                    algorithm: 'sha256',
                    encoding: 'hex',
                    source: certificate,
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
    verifyCertificate
}
