import { expect } from 'chai';
import { requestsReducer } from '../index';

describe('requests reducer', () => {
  it('should return the initial state', () => {
    expect(
      requestsReducer(undefined, {})
    ).to.deep.equal({});
  });

  it('should handle actions with meta.httpRequest property', () => {
    expect(
      requestsReducer({}, {
        type: 'ANYTHING',
        meta: {
          httpRequest: { url: 'testUrl', done: false }
        }
      })
    ).to.deep.equal({
      testUrl: true
    });

    expect(
      requestsReducer({
        testUrl: true
      }, {
        type: 'ANYTHING',
        meta: {
          httpRequest: { url: 'testUrl', done: false }
        }
      })
    ).to.deep.equal({
      testUrl: true
    });

    expect(
      requestsReducer({
        testUrl: true
      }, {
        type: 'ANYTHING',
        meta: {
          httpRequest: { url: 'testUrl', done: false }
        }
      })
    ).to.deep.equal({
      testUrl: true
    });

    expect(
      requestsReducer({
        testUrl: true
      }, {
        type: 'ANYTHING',
        meta: {
          httpRequest: { url: 'testUrl', done: true }
        }
      })
    ).to.deep.equal({});
  });

  it('should not handle actions without meta.httpRequest property', () => {
    expect(
      requestsReducer({}, {
        type: 'ANYTHING',
      })
    ).to.deep.equal({});

    expect(
      requestsReducer({
        testUrl: true
      }, {
        type: 'ANYTHING'
      })
    ).to.deep.equal({
      testUrl: true
    });
  });
});
