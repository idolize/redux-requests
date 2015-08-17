import chai, { expect } from 'chai';
import { attemptRequest } from '../index';
import { polyfill as promisePolyfill } from 'es6-promise';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
promisePolyfill();


describe('attemptRequest helper function', () => {
  let dispatched;
  beforeEach(() => {
    dispatched = [];
  });
  it('should add meta.httpRequest fields to actions', () => {
    const actions = {
      begin: () => ({
        type: 'TEST_ACTION'
      }),
      success: response => ({
        type: 'TEST_ACTION',
        payload: {
          response
        }
      }),
      failure: error => ({
        type: 'TEST_ACTION',
        error
      })
    };
    const promise = new Promise(resolve => resolve('done'));
    attemptRequest('testUrl', actions, () => promise, action => dispatched.push(action));
    return promise.then(response => {
      expect(dispatched).to.deep.equal([
        {
          type: 'TEST_ACTION',
          meta: { httpRequest: { url: 'testUrl', done: false } }
        },
        {
          type: 'TEST_ACTION',
          payload: { response: 'done' },
          meta: { httpRequest: { url: 'testUrl', done: true } }
        }
      ]);
    });
  });

  it('should bail out if begin action is not dispatched', () => {
    const actions = {
      begin: () => ({
        type: 'TEST_ACTION'
      }),
      success: response => ({
        type: 'TEST_ACTION',
        payload: {
          response
        }
      }),
      failure: error => ({
        type: 'TEST_ACTION',
        error
      })
    };
    const promise = new Promise(resolve => resolve('done'));
    attemptRequest('testUrl', actions, () => promise, action => {
      if (!action.meta.httpRequest.done) return undefined;
      return dispatched.push(action);
    });
    return promise.then(response => {
      expect(dispatched).to.deep.equal([]);
    });
  });

  it.only('should dispatch failure action returned by functions when Promise throws', () => {
    const actions = {
      begin: () => ({
        type: 'TEST_ACTION'
      }),
      success: response => ({
        type: 'TEST_ACTION',
        payload: {
          response
        }
      }),
      failure: error => ({
        type: 'TEST_ACTION',
        error
      })
    };
    const error = new Error('error');
    const promise = new Promise((resolve, reject) => reject(error));
    attemptRequest('testUrl', actions, () => promise, action => dispatched.push(action));
    return promise.catch(response => {
      console.log(dispatched[0]);
      expect(dispatched).to.deep.equal([
        {
          type: 'TEST_ACTION',
          meta: { httpRequest: { url: 'testUrl', done: false } }
        },
        {
          type: 'TEST_ACTION',
          error: error,
          meta: { httpRequest: { url: 'testUrl', done: true } }
        }
      ]);
    });
  });
});
