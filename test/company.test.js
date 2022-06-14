const helper = require('node-red-node-test-helper');
const companyNode = require('../company/company.js');
const axios = require('axios');
const { URL_TO_ENV_MAP } = require('../resources/constants');
const fakeAccessToken = 'test';
const fakeCompanyId = 'test';

jest.mock('axios');

helper.init(require.resolve('node-red'));

describe('get company by id Node', function () {
    beforeEach(function (done) {
        helper.startServer(done);
        helper.settings; // take a look at what is expected
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
            try {
                expect(axios.get).toHaveBeenCalledWith(`${URL_TO_ENV_MAP['staging']}/api/companies/${fakeCompanyId}`, {
                    headers: {
                        Authorization: `Bearer ${fakeAccessToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                done();
            } catch (error) {
                done(error);
            }
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
            try {
                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                // expect(spy).toHaveBeenCalledWith('Please add an access token');
                // node-test-helper does not resolve messages, adding the path as a fallback
                expect(spy).toHaveBeenCalledWith('company.errors.accessToken');
                spy.mockRestore();
                done();
            } catch (error) {
                done(error);
            }
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
            try {
                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                // expect(spy).toHaveBeenCalledWith('Please add a company id');
                // node-test-helper does not resolve messages, adding the path as a fallback
                expect(spy).toHaveBeenCalledWith('company.errors.companyId');
                spy.mockRestore();
                done();
            } catch (error) {
                done(error);
            }
        });
    });
});
