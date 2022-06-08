require('dotenv').config();
const helper = require('node-red-node-test-helper');
const verifyNode = require('../verify/verify.js');
const certificate = require('../cert.json');

helper.init(require.resolve('node-red'));

describe('verify Node', function () {
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
                type: 'verify certificate',
                name: 'verify certificate',
            },
        ];
        helper.load(verifyNode, flow, function () {
            const n1 = helper.getNode('n1');

            try {
                n1.should.have.property('name', 'verify certificate');
            } catch (err) {
                done(err);
            }
        });
    });

    it('should have isValid and hash properties in response', function (done) {
        const flow = [
            {
                id: 'n1',
                type: 'verify certificate',
                name: 'verify certificate',
            },
            { id: 'n2', type: 'helper' },
        ];
        helper.load(verifyNode, flow, function () {
            const n1 = helper.getNode('n1');
            const n2 = helper.getNode('n2');
            n2.on('input', function (msg) {
                try {
                    msg.should.have.property('payload');
                    msg.payload.should.have.property('isValid');
                    msg.payload.should.have.property('hash');
                } catch (err) {
                    done(err);
                }
            });
            n1.receive({
                payload: certificate,
                accessToken: process.env.ACCESS_TOKEN,
            });
            done();
        });
    });

    // it('when no accessToken is present, a warning will be shown', function (done) {
    //     const flow = [
    //         { id: "n1", type: "hash", name: "hash", wires:[["n2"]] },
    //         { id: "n2", type: "helper" }
    //     ];
    //     helper.load(hash, flow, function () {
    //         const n1 = helper.getNode("n1");
    //         n1.receive({ payload: certificate });
    //         n1.warn.should.be.calledWithExactly('Please add an access token');
    //         done();
    //     });
    // });

    it('when no certificate is present, a warning will be shown', function (done) {
        const flow = [
            {
                id: 'n1',
                type: 'verify certificate',
                name: 'verify certificate',
            },
            { id: 'n2', type: 'helper' },
        ];
        helper.load(verifyNode, flow, function () {
            const n1 = helper.getNode('n1');
            n1.receive({});
            n1.warn.should.be.calledWithExactly(
                'Please add a valid JSON certificate to global.certificate or msg.payload'
            );
            done();
        });
    });
});
