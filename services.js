const axios = require('axios');
const { BASE_URL } = require('./constants');

async function notarizeCertificate(certificate, accessToken, mode, company, identity) {
    try {
        const response = await axios.post(
            `${BASE_URL}/api/certificates/notarize/notarize?identity=${identity}&mode=${mode ? mode : 'test'}`,
            certificate,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    company: company,
                },
            }
        );
        return response;
    } catch (error) {
        return error;
    }
}

module.exports = {
    notarizeCertificate,
};
