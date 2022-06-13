module.exports = function (RED) {
    'use strict';
    const path = require('path');
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
    const DEV_URL = process.env.DEV_URL;
    const axios = require('axios');
    const { URL_TO_ENV_MAP, ALGORITHM_OPTIONS, ENCODING_OPTIONS } = require('../constants');
    const validateCertificate = require('../utils/validateCertificate');

    function hashCertificate(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const globalContext = this.context().global;
        const apiConfig = RED.nodes.getNode(config.apiConfig);
        let configAlgorithm = config.algorithm;
        let configEncoding = config.encoding;

        node.on('input', async (msg, send, done) => {
            let certificate = msg.payload || globalContext.get('certificate');
            const accessToken = msg.accessToken || apiConfig?.accessToken;
            const environment = msg.environment || apiConfig?.environment || 'staging';
            const BASE_URL = URL_TO_ENV_MAP[environment];
            const url = `${DEV_URL ? DEV_URL : BASE_URL}/api/certificates/hash`;
            const algorithm = msg.algorithm || configAlgorithm || 'sha256';
            const encoding = msg.encoding || configEncoding || 'hex';

            if (!accessToken) {
                node.warn(RED._('hash.errors.accessToken'));
                done();
            } else if (!ALGORITHM_OPTIONS.includes(algorithm)) {
                node.warn(RED._('hash.errors.algorithm'));
                done();
            } else if (!ENCODING_OPTIONS.includes(encoding)) {
                node.warn(RED._('hash.errors.encoding'));
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
