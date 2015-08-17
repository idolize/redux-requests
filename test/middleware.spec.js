import { expect } from 'chai';
import { createRequestMiddleware } from '../index';


describe('requests middleware', () => {
  let middleware, fakeStore, dispatchWithStoreOf, dispatched;
  before(() => {
    middleware = createRequestMiddleware(state => state);
    fakeStore = fakeData => ({
      getState() {
        return fakeData;
      }
    });
  }); 
  beforeEach(() => {
    dispatched = null;
    dispatchWithStoreOf = (storeData, action) => {
      const dispatch = middleware(fakeStore(storeData))(action => dispatched = action);
      dispatch(action);
      return dispatched;
    }
  });

  it('should cancel actions with pending requests', () => {
    const action = {
      type: 'TEST_ACTION',
      payload: {},
      meta: {
        httpRequest: { url: 'testUrl', done: false }
      }
    };
    
    expect(dispatchWithStoreOf({
      testUrl: true
    }, action)).to.not.exist;
  });

  it('should allow actions with pending requests if the action is done', () => {
    const action = {
      type: 'TEST_ACTION',
      payload: {},
      meta: {
        httpRequest: { url: 'testUrl', done: true }
      }
    };
    
    expect(dispatchWithStoreOf({
      testUrl: true
    }, action)).to.deep.equal(action);
  });

  it('should allow actions without pending requests', () => {
    const action = {
      type: 'TEST_ACTION',
      payload: {},
      meta: {
        httpRequest: { url: 'testUrl', done: false }
      }
    };
    
    expect(dispatchWithStoreOf({}, action)).to.deep.equal(action);
  });

  it('should do nothing to actions without meta.httpRequest', () => {
    const action = {
      type: 'TEST_ACTION',
      payload: {}
    };
    
    expect(dispatchWithStoreOf({
      testUrl: true
    }, action)).to.deep.equal(action);
  });
});
