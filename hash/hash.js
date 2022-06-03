/* eslint-disable no-param-reassign */
module.exports = function (RED) {
    const axios = require('axios');
    const baseUrl = 'https://app.s1seven.dev';

    async function getHash(certificate, accessToken) {
        try {
            const response = await axios
                .post(
                    `${baseUrl}/api/certificates/hash`,
                    {
                        algorithm: 'sha256',
                        encoding: 'hex',
                        source: certificate,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    },
                );

            return response;
        } catch (error) {
            return error;
        }
    }

    function hashCertificate(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const globalContext = this.context().global;

        node.on('input', async (msg, send, done) => {
            let certificate = msg.payload || globalContext.get('certificate');
            const accessToken = msg.accessToken || globalContext.get('accessToken');

            // Convert object to JSON if necessary
            if (certificate instanceof Object) {
                try {
                    certificate = JSON.stringify(certificate);
                } catch (error) {
                    node.warn(error);
                    done(error);
                }
            }

            if (!accessToken) {
                node.warn('Please add an access token');
            } else if (certificate && typeof certificate === 'string') {
                const response = await getHash(certificate, accessToken, msg);

                if (response instanceof Error) {
                    node.warn(response);
                    done(response);
                } else {
                    msg.payload = response.data;
                    send(msg);
                }
            } else {
                node.warn('Please add a valid JSON certificate to global.certificate or msg.payload');
                done();
            }
        });
    }
    RED.nodes.registerType('hash', hashCertificate);
};
