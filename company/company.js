module.exports = function (RED) {
    'use strict';
    const axios = require('axios');
    const { BASE_URL } = require('../constants');

    function getCompany(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const apiConfig = RED.nodes.getNode(config.apiConfig);

        node.on('input', async (msg, send, done) => {
            const accessToken = msg.accessToken || apiConfig?.accessToken;
            const app = msg.app || apiConfig?.app;
            const companyId = msg.companyId || apiConfig?.companyId;
            const url = `${BASE_URL}${app ? app : 'dev'}/api/company/${companyId}`;

            if (!accessToken) {
                node.warn(RED._('company.errors.accessToken'));
                done();
            } else if (!companyId) {
                node.warn(RED._('company.errors.companyId'));
                done();
            } else {
                try {
                    const response = await axios.get(url, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
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
            }
        });
    }
    RED.nodes.registerType('get company', getCompany);
};
