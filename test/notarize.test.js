require('dotenv').config();
const helper = require('node-red-node-test-helper');
const notarizeNode = require('../notarize/notarize.js');
const certificate = require('../cert.json');
const axios = require('axios');
const { URL_TO_ENV_MAP } = require('../resources/constants');
const fakeAccessToken = 'test';
const fakeIdentity = 'test';
const fakeCompanyId = 'test';

jest.mock('axios');

helper.init(require.resolve('node-red'));

describe('notarize Node', function () {
    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should be loaded', function (done) {
        const flow = [{ id: 'n1', type: 'notarize certificate', name: 'notarize certificate' }];
        helper.load(notarizeNode, flow, function () {
            const n1 = helper.getNode('n1');
            try {
                expect(n1).toHaveProperty('name', 'notarize certificate');
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it('api should be called with the correct url and body', function (done) {
        const flow = [{ id: 'n1', type: 'notarize certificate', name: 'notarize certificate' }];
        axios.post.mockResolvedValue({ data: { value: 'hashValue' } });

        helper.load(notarizeNode, flow, function () {
            const n1 = helper.getNode('n1');

            n1.receive({
                payload: certificate,
                accessToken: fakeAccessToken,
                identity: fakeIdentity,
                companyId: fakeCompanyId,
            });

            try {
                expect(axios.post).toHaveBeenCalledWith(
                    `${URL_TO_ENV_MAP['staging']}/api/certificates/notarize?identity=${fakeIdentity}&mode=test`,
                    certificate,
                    {
                        headers: {
                            Authorization: `Bearer ${fakeAccessToken}`,
                            'Content-Type': 'application/json',
                            company: fakeCompanyId,
                        },
                    }
                );

                done();
            } catch (error) {
                done(error);
            }
        });
    });

    it('when no accessToken is present, a warning will be shown', function (done) {
        const flow = [
            { id: 'n1', type: 'notarize certificate', name: 'notarize certificate', wires: [['n2']] },
            { id: 'n2', type: 'helper' },
        ];

        helper.load(notarizeNode, flow, function () {
            const n1 = helper.getNode('n1');
            const spy = jest.spyOn(n1, 'warn');
            n1.receive({
                payload: certificate,
                identity: fakeIdentity,
                companyId: fakeCompanyId,
            });
            try {
                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                // expect(spy).toHaveBeenCalledWith('Please add an access token'); // this does not resolve, hash.errors.accessToken
                expect(spy).toHaveBeenCalledWith('notarize.errors.accessToken'); // figure out why this doesn't resolve in testing
                done();
            } catch (error) {
                done(error);
            }
            spy.mockRestore();
        });
    });

    it('when no certificate is present, a warning will be shown', function (done) {
        const flow = [
            { id: 'n1', type: 'notarize certificate', name: 'notarize certificate', wires: [['n2']] },
            { id: 'n2', type: 'helper' },
        ];

        helper.load(notarizeNode, flow, function () {
            const n1 = helper.getNode('n1');
            const spy = jest.spyOn(n1, 'warn');
            n1.receive({
                accessToken: fakeAccessToken,
                identity: fakeIdentity,
                companyId: fakeCompanyId,
            });
            try {
                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                // expect(spy).toHaveBeenCalledWith(
                //     'Please add a valid JSON certificate to global.certificate or msg.payload'
                // ); // this does not resolve in testing
                expect(spy).toHaveBeenCalledWith('notarize.errors.validCertificate'); // figure out why this doesn't resolve in testing
                done();
            } catch (error) {
                done(error);
            }
            spy.mockRestore();
        });
    });

    it('when no company id is present, a warning will be shown', function (done) {
        const flow = [
            { id: 'n1', type: 'notarize certificate', name: 'notarize certificate', wires: [['n2']] },
            { id: 'n2', type: 'helper' },
        ];

        helper.load(notarizeNode, flow, function () {
            const n1 = helper.getNode('n1');
            const spy = jest.spyOn(n1, 'warn');
            n1.receive({
                accessToken: fakeAccessToken,
                payload: certificate,
                identity: fakeIdentity,
            });
            try {
                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                // expect(spy).toHaveBeenCalledWith('Please add a company id'); // this does not resolve in testing
                expect(spy).toHaveBeenCalledWith('notarize.errors.companyId'); // figure out why this doesn't resolve in testing
                done();
            } catch (error) {
                done(error);
            }
            spy.mockRestore();
        });
    });

    it('when no identity is present, a warning will be shown', function (done) {
        const flow = [
            { id: 'n1', type: 'notarize certificate', name: 'notarize certificate', wires: [['n2']] },
            { id: 'n2', type: 'helper' },
        ];

        helper.load(notarizeNode, flow, function () {
            const n1 = helper.getNode('n1');
            const spy = jest.spyOn(n1, 'warn');
            n1.receive({
                accessToken: fakeAccessToken,
                payload: certificate,
                companyId: fakeCompanyId,
            });
            try {
                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                // expect(spy).toHaveBeenCalledWith('Please add an identity'); // this does not resolve in testing
                expect(spy).toHaveBeenCalledWith('notarize.errors.identity'); // figure out why this doesn't resolve in testing
                done();
            } catch (error) {
                done(error);
            }
            spy.mockRestore();
        });
    });
});
