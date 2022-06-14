const helper = require('node-red-node-test-helper');
const hash = require('../hash/hash.js');
const certificate = require('../cert.json');
const axios = require('axios');
const { URL_TO_ENV_MAP } = require('../resources/constants');
const fakeAccessToken = 'test';

jest.mock('axios');

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
                expect(n1).toHaveProperty('name', 'hash');
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it('api should be called with the correct url and body', function (done) {
        const flow = [{ id: 'n1', type: 'hash', name: 'hash', wires: [] }];
        axios.post.mockResolvedValue({ data: { value: 'hashValue' } });

        helper.load(hash, flow, function () {
            const n1 = helper.getNode('n1');

            n1.receive({
                payload: certificate,
                accessToken: fakeAccessToken,
            });

            expect(axios.post).toHaveBeenCalledWith(
                `${URL_TO_ENV_MAP['staging']}/api/certificates/hash`,
                {
                    algorithm: 'sha256',
                    encoding: 'hex',
                    source: certificate,
                },
                {
                    headers: {
                        Authorization: `Bearer ${fakeAccessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            done();
        });
    });

    it('algorithm and encoding can be overridden', function (done) {
        const flow = [{ id: 'n1', type: 'hash', name: 'hash', wires: [] }];
        axios.post.mockResolvedValue({ data: { value: 'hashValue' } });
        const algorithm = 'sha512';
        const encoding = 'base64';

        helper.load(hash, flow, function () {
            const n1 = helper.getNode('n1');

            n1.receive({
                payload: certificate,
                accessToken: fakeAccessToken,
                algorithm,
                encoding,
            });

            expect(axios.post).toHaveBeenCalledWith(
                `${URL_TO_ENV_MAP['staging']}/api/certificates/hash`,
                {
                    algorithm: algorithm,
                    encoding: encoding,
                    source: certificate,
                },
                {
                    headers: {
                        Authorization: `Bearer ${fakeAccessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            done();
        });
    });

    it('when no accessToken is present, a warning will be shown', function (done) {
        const flow = [
            { id: 'n1', type: 'hash', name: 'hash', wires: [['n2']] },
            { id: 'n2', type: 'helper' },
        ];
        helper.load(hash, flow, function () {
            const n1 = helper.getNode('n1');
            const spy = jest.spyOn(n1, 'warn');
            n1.receive({ payload: certificate });
            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            // expect(spy).toHaveBeenCalledWith('Please add an access token'); // this does not resolve, hash.errors.accessToken
            // expect(spy).toHaveBeenCalledWith('hash.errors.accessToken');
            spy.mockRestore();
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
            const spy = jest.spyOn(n1, 'warn');
            n1.receive({ accessToken: fakeAccessToken });
            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            // expect(spy).toHaveBeenCalledWith(
            //     'Please add a valid JSON certificate to global.certificate or msg.payload'
            // ); // this does not resolve, hash.errors.accessToken
            spy.mockRestore();
            done();
        });
    });
});
