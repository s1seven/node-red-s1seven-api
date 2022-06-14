module.exports = function (RED) {
    'use strict';
    const path = require('path');
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
    const DEV_URL = process.env.DEV_URL;
    const axios = require('axios');
    const { URL_TO_ENV_MAP } = require('../resources/constants');
    const validateCertificate = require('../utils/validateCertificate');

    function verifyCertificateNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const globalContext = this.context().global;

        node.on('input', async (msg, send, done) => {
            const apiConfig = RED.nodes.getNode(config.apiConfig);
            let certificate = msg.payload || globalContext.get('certificate');
            const mode = msg.mode || apiConfig?.test;
            const environment = msg.environment || apiConfig?.environment || 'staging';
            const BASE_URL = URL_TO_ENV_MAP[environment];
            const url = `${DEV_URL ? DEV_URL : BASE_URL}/api/certificates/verify/?mode=${mode ? mode : 'test'}`;

            if (certificate) {
                try {
                    certificate = validateCertificate(certificate);
                    const response = await axios.post(url, certificate, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    msg.payload = response.data;
                    send(msg);
                    done();
                } catch (error) {
                    node.error(error);
                    done(error);
                }
            } else {
                node.warn(RED._('verify.errors.validCertificate'));
                done();
            }
        });
    }
    RED.nodes.registerType('verify certificate', verifyCertificateNode);
};
