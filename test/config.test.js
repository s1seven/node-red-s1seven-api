const helper = require('node-red-node-test-helper');
const configNode = require('../config/api-config.js');

helper.init(require.resolve('node-red'));

describe('config Node', function () {
    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should be loaded', function (done) {
        const flow = [
            {
                id: 'n1',
                type: 'api-config',
                name: 'api-config',
            },
        ];

        helper.load(configNode, flow, function () {
            const n1 = helper.getNode('n1');
            try {
                expect(n1).toHaveProperty('name', 'api-config');
                done();
            } catch (err) {
                done(err);
            }
        });
    });
});
