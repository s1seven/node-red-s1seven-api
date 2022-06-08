module.exports = function (RED) {
    'use strict';
    const axios = require('axios');
    const { BASE_URL } = require('../constants');
    const validateCertificate = require('../utils/validateCertificate');

    function verifyCertificateNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const globalContext = this.context().global;

        node.on('input', async (msg, send, done) => {
            const apiConfig = RED.nodes.getNode(config.apiConfig);
            let certificate = msg.payload || globalContext.get('certificate');
            const mode = msg.mode || apiConfig?.test;

            if (certificate) {
                try {
                    certificate = validateCertificate(certificate);
                    const response = await axios.post(
                        `${BASE_URL}/api/certificates/verify/?mode=${mode ? mode : 'test'}`,
                        certificate,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                    msg.payload = response.data;
                    send(msg);
                    done();
                } catch (error) {
                    node.error(error);
                    done(error);
                }
            } else {
                node.warn('Please add a valid JSON certificate to global.certificate or msg.payload');
                done();
            }
        });
    }
    RED.nodes.registerType('verify certificate', verifyCertificateNode);
};
