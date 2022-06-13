module.exports = function (RED) {
    'use strict';
    const path = require('path');
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
    const DEV_URL = process.env.DEV_URL;
    const axios = require('axios');
    const { BASE_URL } = require('../constants');

    function getIdentities(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const apiConfig = RED.nodes.getNode(config.apiConfig);

        node.on('input', async (msg, send, done) => {
            const accessToken = msg.accessToken || apiConfig?.accessToken;
            const companyId = msg.companyId || apiConfig?.companyId;
            const mode = msg.mode || apiConfig?.test;
            const app = msg.app || apiConfig?.app;
            const FULL_BASE_URL = `${BASE_URL}${app ? app : 'dev'}`;
            const url = `${DEV_URL ? DEV_URL : FULL_BASE_URL}/api/identities?mode=${mode ? mode : 'test'}`;

            if (!accessToken) {
                node.warn(RED._('identity.errors.accessToken'));
                done();
            } else if (!companyId) {
                node.warn(RED._('identity.errors.companyId'));
                done();
            } else {
                try {
                    const response = await axios.get(url, {
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
            }
        });
    }
    RED.nodes.registerType('get identities', getIdentities);
};
