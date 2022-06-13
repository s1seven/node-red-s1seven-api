module.exports = function (RED) {
    'use strict';
    const path = require('path');
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
    const DEV_URL = process.env.DEV_URL;
    const axios = require('axios');
    const { BASE_URL } = require('../constants');
    const validateCertificate = require('../utils/validateCertificate');

    function notarize(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const globalContext = this.context().global;
        const apiConfig = RED.nodes.getNode(config.apiConfig);

        node.on('input', async (msg, send, done) => {
            const accessToken = msg.accessToken || apiConfig?.accessToken;
            const companyId = msg.companyId || apiConfig?.companyId;
            const mode = msg.mode || apiConfig?.test;
            const identity = msg.identity || globalContext.get('identity');
            const app = msg.app || apiConfig?.app;
            const FULL_BASE_URL = `${BASE_URL}${app ? app : 'dev'}`;
            let certificate = msg.payload || globalContext.get('certificate');

            const url = `${DEV_URL ? DEV_URL : FULL_BASE_URL}/api/certificates/notarize?identity=${identity}&mode=${
                mode ? mode : 'test'
            }`;

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
                    node.error(error);
                    done(error);
                }
            } else {
                node.warn(RED._('notarize.errors.validCertificate'));
                done();
            }
        });
    }
    RED.nodes.registerType('notarize certificate', notarize);
};
