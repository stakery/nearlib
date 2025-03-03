const BN = require('bn.js');
const testUtils = require('./test-utils');

let nearjs;
let workingAccount;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;

beforeAll(async () => {
    nearjs = await testUtils.setUpTestConnection();
    workingAccount = await testUtils.createAccount(await nearjs.account(testUtils.testAccountName), { amount: testUtils.INITIAL_BALANCE.mul(new BN(100)) });
});

describe('with promises', () => {
    let contract, contract1, contract2;
    let oldLog;
    let logs;
    let contractName = testUtils.generateUniqueString('cnt');
    let contractName1 = testUtils.generateUniqueString('cnt');
    let contractName2 = testUtils.generateUniqueString('cnt');

    beforeAll(async () => {
        contract = await testUtils.deployContract(workingAccount, contractName);
        contract1 = await testUtils.deployContract(workingAccount, contractName1);
        contract2 = await testUtils.deployContract(workingAccount, contractName2);
    });

    beforeEach(async () => {
        oldLog = console.log;
        logs = [];
        console.log = function() {
            logs.push(Array.from(arguments).join(' '));
        };
    });

    afterEach(async () => {
        console.log = oldLog;
    });

    // -> means async call
    // => means callback

    test('single promise, no callback (A->B)', async () => {
        const realResult = await contract.callPromise({args: {
            receiver: contractName1,
            methodName: 'callbackWithName',
            args: null,
            gas: 300000,
            balance: 0,
            callback: null,
            callbackArgs: null,
            callbackBalance: 0,
            callbackGas: 0,
        }});
        const lastResult = await contract1.getLastResult();
        expect(lastResult).toEqual({
            rs: [],
            n: contractName1,
        });
        expect(realResult).toEqual(lastResult);
    });

    test('single promise with callback (A->B=>A)', async () => {
        const realResult = await contract.callPromise({args: {
            receiver: contractName1,
            methodName: 'callbackWithName',
            args: null,
            gas: 300000,
            balance: 0,
            callback: 'callbackWithName',
            callbackArgs: null,
            callbackBalance: 0,
            callbackGas: 200000,
        }});
        const lastResult1 = await contract1.getLastResult();
        expect(lastResult1).toEqual({
            rs: [],
            n: contractName1,
        });
        const lastResult = await contract.getLastResult();
        expect(lastResult).toEqual({
            rs: [{
                ok: true,
                r: lastResult1,
            }],
            n: contractName,
        });
        expect(realResult).toEqual(lastResult);
    });

    test('two promises, no callbacks (A->B->C)', async () => {
        const realResult = await contract.callPromise({args: {
            receiver: contractName1,
            methodName: 'callPromise',
            args: {
                receiver: contractName2,
                methodName: 'callbackWithName',
                args: null,
                gas: 400000,
                balance: 0,
                callback: null,
                callbackArgs: null,
                callbackBalance: 0,
                callbackGas: 200000,
            },
            gas: 600000,
            balance: 0,
            callback: null,
            callbackArgs: null,
            callbackBalance: 0,
            callbackGas: 600000,
        }});
        const lastResult2 = await contract2.getLastResult();
        expect(lastResult2).toEqual({
            rs: [],
            n: contractName2,
        });
        expect(realResult).toEqual(lastResult2);
    });

    test('two promises, with two callbacks (A->B->C=>B=>A)', async () => {
        const realResult = await contract.callPromise({args: {
            receiver: contractName1,
            methodName: 'callPromise',
            args: {
                receiver: contractName2,
                methodName: 'callbackWithName',
                args: null,
                gas: 400000,
                balance: 0,
                callback: 'callbackWithName',
                callbackArgs: null,
                callbackBalance: 0,
                callbackGas: 200000,
            },
            gas: 1000000,
            balance: 0,
            callback: 'callbackWithName',
            callbackArgs: null,
            callbackBalance: 0,
            callbackGas: 300000,
        }});
        const lastResult2 = await contract2.getLastResult();
        expect(lastResult2).toEqual({
            rs: [],
            n: contractName2,
        });
        const lastResult1 = await contract1.getLastResult();
        expect(lastResult1).toEqual({
            rs: [{
                ok: true,
                r: lastResult2,
            }],
            n: contractName1,
        });
        const lastResult = await contract.getLastResult();
        expect(lastResult).toEqual({
            rs: [{
                ok: true,
                r: lastResult1,
            }],
            n: contractName,
        });
        expect(realResult).toEqual(lastResult);
    });

    test('cross contract call with callbacks (A->B->A=>B=>A)', async () => {
        const realResult = await contract.callPromise({args: {
            receiver: contractName1,
            methodName: 'callPromise',
            args: {
                receiver: contractName,
                methodName: 'callbackWithName',
                args: null,
                gas: 400000,
                balance: 0,
                callback: 'callbackWithName',
                callbackArgs: null,
                callbackBalance: 0,
                callbackGas: 400000,
            },
            gas: 1000000,
            balance: 0,
            callback: 'callbackWithName',
            callbackArgs: null,
            callbackBalance: 0,
            callbackGas: 300000,
        }});
        const lastResult1 = await contract1.getLastResult();
        expect(lastResult1).toEqual({
            rs: [{
                ok: true,
                r: {
                    rs: [],
                    n: contractName,
                },
            }],
            n: contractName1,
        });
        const lastResult = await contract.getLastResult();
        expect(lastResult).toEqual({
            rs: [{
                ok: true,
                r: lastResult1,
            }],
            n: contractName,
        });
        expect(realResult).toEqual(lastResult);
    });

    test('2 promises with 1 skipped callbacks (A->B->C=>A)', async () => {
        const realResult = await contract.callPromise({args: {
            receiver: contractName1,
            methodName: 'callPromise',
            args: {
                receiver: contractName2,
                methodName: 'callbackWithName',
                args: null,
                gas: 200000,
                balance: 0,
                callback: null,
                callbackArgs: null,
                callbackBalance: 0,
                callbackGas: 200000,
            },
            gas: 500000,
            balance: 0,
            callback: 'callbackWithName',
            callbackArgs: null,
            callbackBalance: 0,
            callbackGas: 300000
        }});
        const lastResult2 = await contract2.getLastResult();
        expect(lastResult2).toEqual({
            rs: [],
            n: contractName2,
        });
        const lastResult = await contract.getLastResult();
        expect(lastResult).toEqual({
            rs: [{
                ok: true,
                r: lastResult2,
            }],
            n: contractName,
        });
        expect(realResult).toEqual(lastResult);
    });

    test('two promises, with one callbacks to B only (A->B->C=>B)', async () => {
        const realResult = await contract.callPromise({args: {
            receiver: contractName1,
            methodName: 'callPromise',
            args: {
                receiver: contractName2,
                methodName: 'callbackWithName',
                args: null,
                gas: 400000,
                balance: 0,
                callback: 'callbackWithName',
                callbackArgs: null,
                callbackBalance: 0,
                callbackGas: 400000,
            },
            gas: 1000000,
            balance: 0,
            callback: null,
            callbackArgs: null,
            callbackBalance: 0,
            callbackGas: 0,
        }});
        const lastResult2 = await contract2.getLastResult();
        expect(lastResult2).toEqual({
            rs: [],
            n: contractName2,
        });
        const lastResult1 = await contract1.getLastResult();
        expect(lastResult1).toEqual({
            rs: [{
                ok: true,
                r: lastResult2,
            }],
            n: contractName1,
        });
        expect(realResult).toEqual(lastResult1);
    });

});
