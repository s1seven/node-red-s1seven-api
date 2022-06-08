require('dotenv').config();
const helper = require('node-red-node-test-helper');
const hash = require('../hash/hash.js');
const certificate = require('../cert.json');

helper.init(require.resolve('node-red'));

describe('hashing Node', function () {
    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should be loaded', function (done) {
        const flow = [{ id: 'n1', type: 'hash', name: 'hash' }];
        helper.load(hash, flow, function () {
            const n1 = helper.getNode('n1');
            try {
                n1.should.have.property('name', 'hash');
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it('should return a hash', function (done) {
        const flow = [
            { id: 'n1', type: 'hash', name: 'hash', wires: [['n2']] },
            { id: 'n2', type: 'helper' },
        ];
        helper.load(hash, flow, function () {
            const n2 = helper.getNode('n2');
            const n1 = helper.getNode('n1');
            n2.on('input', function (msg) {
                try {
                    msg.should.have.property('payload');
                    msg.payload.should.have.property('value');
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
    // try mocking axios (check schema tools)
    // if not, create fake server

    it('when no accessToken is present, a warning will be shown', function (done) {
        const flow = [
            { id: 'n1', type: 'hash', name: 'hash', wires: [['n2']] },
            { id: 'n2', type: 'helper' },
        ];
        helper.load(hash, flow, function () {
            const n1 = helper.getNode('n1');
            n1.receive({ payload: certificate });
            n1.warn.should.be.calledWithExactly('Please add an access token');
            done();
        });
    });

    it('when no certificate is present, a warning will be shown', function (done) {
        const flow = [
            { id: 'n1', type: 'hash', name: 'hash', wires: [['n2']] },
            { id: 'n2', type: 'helper' },
        ];
        helper.load(hash, flow, function () {
            const n1 = helper.getNode('n1');
            n1.receive({ accessToken: process.env.ACCESS_TOKEN });
            n1.warn.should.be.calledWithExactly(
                'Please add a valid JSON certificate to global.certificate or msg.payload'
            );
            done();
        });
    });
});
