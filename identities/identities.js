module.exports = function (RED) {
    'use strict';
    const path = require('path');
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
    const DEV_URL = process.env.DEV_URL;
    const axios = require('axios');
    const { URL_TO_ENV_MAP } = require('../resources/constants');

    function getIdentities(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const globalContext = this.context().global;
        const apiConfig = RED.nodes.getNode(config.apiConfig);

        node.on('input', async (msg, send, done) => {
            const accessToken = msg.accessToken || apiConfig?.accessToken || globalContext.get('accessToken');
            const companyId = msg.companyId || apiConfig?.companyId || globalContext.get('companyId');
            const mode = msg.mode || apiConfig?.test;
            const environment = msg.environment || apiConfig?.environment || 'staging';
            const BASE_URL = URL_TO_ENV_MAP[environment];
            const url = `${DEV_URL ? DEV_URL : BASE_URL}/api/identities?mode=${mode ? mode : 'test'}`;

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
                    if (error instanceof axios.AxiosError) {
                        node.error(error.response);
                        done(error.response);
                    } else {
                        node.error(error);
                        done(error);
                    }
                }
            }
        });
    }
    RED.nodes.registerType('get identities', getIdentities);
};
