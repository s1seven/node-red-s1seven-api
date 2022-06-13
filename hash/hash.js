module.exports = function (RED) {
    'use strict';
    const path = require('path');
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
    const devUrl = process.env.DEV_URL;
    // if devUrl, replace BASE URL
    const axios = require('axios');
    const { BASE_URL } = require('../constants');
    const validateCertificate = require('../utils/validateCertificate');

    function hashCertificate(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const globalContext = this.context().global;
        const apiConfig = RED.nodes.getNode(config.apiConfig);

        node.on('input', async (msg, send, done) => {
            let certificate = msg.payload || globalContext.get('certificate');
            const accessToken = msg.accessToken || apiConfig?.accessToken;
            const app = msg.app || apiConfig?.app;
            const url = `${BASE_URL}${app ? app : 'dev'}/api/certificates/hash`;
            const algorithm = msg.algorithm || 'sha256';
            const encoding = msg.encoding || 'hex';

            if (!accessToken) {
                node.warn(RED._('hash.errors.accessToken'));
                done();
            } else if (certificate) {
                try {
                    certificate = validateCertificate(certificate);
                    const response = await axios.post(
                        url,
                        {
                            algorithm: algorithm,
                            encoding: encoding,
                            source: certificate,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
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
                node.warn(RED._('hash.errors.validCertificate'));
                done();
            }
        });
    }
    RED.nodes.registerType('hash', hashCertificate);
};
