module.exports = function (RED) {
    "use strict";
    const { getHashOfCertificate } = require('../services');

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
                    node.error(error);
                    done(error);
                }
            }

            if (!accessToken) {
                node.warn('Please add an access token');
                done();
            } else if (certificate && typeof certificate === 'string') {
                const response = await getHashOfCertificate(certificate, accessToken, msg);

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
    RED.nodes.registerType('hash', hashCertificate);
};
