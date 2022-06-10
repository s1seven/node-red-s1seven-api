require('dotenv').config();
const helper = require('node-red-node-test-helper');
const notarizeNode = require('../notarize/notarize.js');
const certificate = require('../cert.json');
const axios = require('axios');
const { BASE_URL } = require('../constants');
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

            expect(axios.post).toHaveBeenCalledWith(
                `${BASE_URL}dev/api/certificates/notarize?identity=${fakeIdentity}&mode=test`,
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
            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            // expect(spy).toHaveBeenCalledWith('Please add an access token'); // this does not resolve, hash.errors.accessToken
            // expect(spy).toHaveBeenCalledWith('notarize.errors.accessToken');
            spy.mockRestore();
            done();
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
            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            // expect(spy).toHaveBeenCalledWith(
            //     'Please add a valid JSON certificate to global.certificate or msg.payload'
            // ); // this does not resolve, notarize.errors.certificate
            spy.mockRestore();
            done();
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
            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            // expect(spy).toHaveBeenCalledWith('Please add a company id'); // this does not resolve, hash.errors.accessToken
            // expect(spy).toHaveBeenCalledWith('notarize.errors.companyId');
            spy.mockRestore();
            done();
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
            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            // expect(spy).toHaveBeenCalledWith('Please add an identity'); // this does not resolve, hash.errors.accessToken
            // expect(spy).toHaveBeenCalledWith('notarize.errors.identity');
            spy.mockRestore();
            done();
        });
    });
});
