module.exports = function (RED) {
    "use strict";
    const { verifyCertificate } = require('../services');

    function verifyCertificateNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const globalContext = this.context().global;

        node.on('input', async (msg, send, done) => {
            let certificate = msg.payload || globalContext.get('certificate');
            const mode = msg.mode || globalContext.get('mode');

            // Convert object to JSON if necessary
            if (certificate instanceof Object) {
                try {
                    certificate = JSON.stringify(certificate);
                } catch (error) {
                    node.error(error);
                    done(error);
                }
            }

            if (certificate && typeof certificate === 'string') {
                const response = await verifyCertificate(certificate, mode);

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
    RED.nodes.registerType('verify certificate', verifyCertificateNode);
};
