module.exports = function (RED) {
    'use strict';
    const path = require('path');
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
    const DEV_URL = process.env.DEV_URL;
    const axios = require('axios');
    const { URL_TO_ENV_MAP } = require('../resources/constants');
    const validateCertificate = require('../utils/validateCertificate');

    function notarize(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const globalContext = this.context().global;
        const apiConfig = RED.nodes.getNode(config.apiConfig);

        node.on('input', async (msg, send, done) => {
            const accessToken = msg.accessToken || apiConfig?.accessToken || globalContext.get('accessToken');
            const companyId = msg.companyId || apiConfig?.companyId || globalContext.get('companyId');
            const mode = msg.mode || apiConfig?.test;
            const identity = msg.identity || config.identity || globalContext.get('identity');
            const environment = msg.environment || apiConfig?.environment || 'staging';
            const BASE_URL = URL_TO_ENV_MAP[environment];
            const url = `${DEV_URL ? DEV_URL : BASE_URL}/api/certificates/notarize?identity=${identity}&mode=${
                mode ? mode : 'test'
            }`;
            let certificate = msg.payload || globalContext.get('certificate');

            if (!accessToken) {
                node.warn(RED._('notarize.errors.accessToken'));
                done();
            } else if (!companyId) {
                node.warn(RED._('notarize.errors.companyId'));
                done();
            } else if (!identity) {
                node.warn(RED._('notarize.errors.identity'));
                done();
            } else if (certificate) {
                try {
                    certificate = validateCertificate(certificate);
                    const response = await axios.post(url, certificate, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                            company: companyId,
                        },
                    });
                    msg.payload = response.data;
                    send(msg);
                    done();
                } catch (error) {
                    if (error instanceof axios.AxiosError) {
                        node.error(error.response);
                        done(error.response);
                    } else {
                        node.error(error);
                        done(error);
                    }
                }
            } else {
                node.warn(RED._('notarize.errors.validCertificate'));
                done();
            }
        });
    }
    RED.nodes.registerType('notarize certificate', notarize);
};
