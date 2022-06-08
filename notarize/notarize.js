module.exports = function (RED) {
    'use strict';
    const { notarizeCertificate } = require('../services');

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
            let certificate = msg.payload || globalContext.get('certificate');

            // Convert object to JSON if necessary
            if (certificate instanceof Object) {
                try {
                    certificate = JSON.stringify(certificate);
                } catch (error) {
                    node.error(error);
                    done(error);
                }
            }

            if (!accessToken) {
                node.warn('Please add an access token');
                done();
            } else if (!companyId) {
                node.warn('Please add a company id');
                done();
            } else if (!identity) {
                node.warn('Please add an identity');
                done();
            } else if (certificate && typeof certificate === 'string') {
                const response = await notarizeCertificate(certificate, accessToken, mode, companyId, identity);

                if (response instanceof Error) {
                    node.error(response);
                    done(response);
                } else {
                    msg.payload = response.data;
                    send(msg);
                    done();
                }
            } else {
                node.warn('Please add a valid JSON certificate to global.certificate or msg.payload');
                done();
            }
        });
    }
    RED.nodes.registerType('notarize a certificate', notarize);
};
