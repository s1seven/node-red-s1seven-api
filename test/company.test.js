const helper = require('node-red-node-test-helper');
const companyNode = require('../company/company.js');
const axios = require('axios');
const { BASE_URL } = require('../constants');
const fakeAccessToken = 'test';
const fakeCompanyId = 'test';

jest.mock('axios');

helper.init(require.resolve('node-red'));

describe('get company by id Node', function () {
    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should be loaded', function (done) {
        const flow = [{ id: 'n1', type: 'get company', name: 'get company' }];
        helper.load(companyNode, flow, function () {
            const n1 = helper.getNode('n1');
            try {
                expect(n1).toHaveProperty('name', 'get company');
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it('api should be called with the correct url and body', function (done) {
        const flow = [{ id: 'n1', type: 'get company', name: 'get company', wires: [] }];
        axios.get.mockResolvedValue({});

        helper.load(companyNode, flow, function () {
            const n1 = helper.getNode('n1');
            n1.receive({
                accessToken: fakeAccessToken,
                companyId: fakeCompanyId,
            });
            expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}dev/api/company/${fakeCompanyId}`, {
                headers: {
                    Authorization: `Bearer ${fakeAccessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            done();
        });
    });

    it('when no accessToken is present, a warning will be shown', function (done) {
        const flow = [
            { id: 'n1', type: 'get company', name: 'get company', wires: [['n2']] },
            { id: 'n2', type: 'helper' },
        ];
        helper.load(companyNode, flow, function () {
            const n1 = helper.getNode('n1');
            const spy = jest.spyOn(n1, 'warn');
            n1.receive({ companyId: fakeCompanyId });
            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            // expect(spy).toHaveBeenCalledWith('Please add an access token'); // this does not resolve, hash.errors.accessToken
            expect(spy).toHaveBeenCalledWith('company.errors.accessToken'); // figure out how to resolve this
            spy.mockRestore();
            done();
        });
    });

    it('when no companyId is present, a warning will be shown', function (done) {
        const flow = [
            { id: 'n1', type: 'get company', name: 'get company', wires: [['n2']] },
            { id: 'n2', type: 'helper' },
        ];

        helper.load(companyNode, flow, function () {
            const n1 = helper.getNode('n1');
            const spy = jest.spyOn(n1, 'warn');
            n1.receive({
                accessToken: fakeAccessToken,
            });
            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            // expect(spy).toHaveBeenCalledWith('Please add a company id'); // this does not resolve
            expect(spy).toHaveBeenCalledWith('company.errors.companyId'); // figure out how to resolve this
            spy.mockRestore();
            done();
        });
    });
});
