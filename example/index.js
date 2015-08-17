import React, {findDOMNode} from 'react';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider, connect } from 'react-redux';
import { polyfill as promisePolyfill } from 'es6-promise';
import { requestsReducer, createRequestMiddleware } from '../index';
import 'whatwg-fetch';
promisePolyfill();

// Helpers
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    let error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

function parseJSON(response) {
  return response.json()
}

function addDelay(delayMs) {
  return response => new Promise(resolve =>
    setTimeout(resolve.bind(this, response), delayMs)
  );
}

function prettyPrintJson(json) {
  return JSON.stringify(json, null, '  ');
}

// Action with Thunk
function loadRepos(userId) {
  return function (dispatch, getState) {
    const url = `https://api.github.com/users/${userId}/repos`;

    attemptRequest(url, {
      begin: () => ({
        type: 'LOAD_REPOS',
        payload: {
          userId
        }
      }),
      success: response => ({
        type: 'LOAD_REPOS',
        payload: {
          userId,
          response
        }
      }),
      failure: error => ({
        type: 'LOAD_REPOS',
        error,
        payload: {
          userId
        }
      })
    }, () => fetch(url)
      .then(checkStatus)
      .then(parseJSON)
      .then(addDelay(5000))
    , dispatch);
  }
}

// Reducer
function githubRepos(state = new Map(), action) {
  let payload = action.payload;
  switch(action.type) {
    case 'LOAD_REPOS':
      return { ...state, [payload.userId]:
        {
          error: action.error ? payload.error : undefined,
          loading: !action.meta.httpRequest.done,
          resp: action.meta.httpRequest.done ? payload.response: undefined
        }
      };
    default:
      return state;
  }
}

// Store (with middleware)
const createStoreWithMiddleware = applyMiddleware(thunkMiddleware, createRequestMiddleware())(createStore);
let store = createStoreWithMiddleware(combineReducers({ requests: requestsReducer, githubRepos }));

// React component
class ReactComp extends React.Component {
  handleClick() {
    const { onFetchReposClick } = this.props;
    const usernameNode = findDOMNode(this.refs.username);
    if (usernameNode.value === '') return;
    
    // Trigger action
    onFetchReposClick(usernameNode.value);
  }
  render() {
    const {
      repos,
      requests
    } = this.props;
    const handleClick = ::this.handleClick;
    return (
      <div style={{padding: 10}}>
        <h1>GitHub Pending Requests Example</h1>
        <p style={{padding: 5, color: 'grey'}}>
         Click to load data for a user, and watch the network requests in your browser dev tools:
         no new requests will be made for the same URL while there is already a request for that URL in flight
         (the request is delayed by 5 seconds to better illustrate the point)
        </p>
        <div style={{width: '50%', float: 'left'}}>
          <h3>User's Repos:</h3>
          <span><input ref="username" placeholder="GitHub username" defaultValue="idolize" /></span>{' '}
          <button onClick={handleClick}>Load Repos</button>
          <div><pre>{ prettyPrintJson(repos) }</pre></div>
        </div>
        <div style={{width: '50%', float: 'right'}}>
          <h3>Pending Requests:</h3>
          <div><pre>{ prettyPrintJson(requests) }</pre></div>
        </div>
        <div style={{clear: 'both'}} />
      </div>
    );
  }
}

function formatRepos(reposByUser) {
  let out = {};

  Object.keys(reposByUser).forEach(user => {
    const userPayload = reposByUser[user];
    out[user] = userPayload.loading ? 'Loading...' :
                userPayload.error ? userPayload.error :
                userPayload.resp ? userPayload.resp.map(repo => repo && (repo.name || repo)) :
                undefined;
  });

  return out;
}

// Map Redux state to component props
function mapStateToProps(state)  {
  return {
    repos: formatRepos(state.githubRepos),
    requests: state.requests
  };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
  return {
    onFetchReposClick: (userId) => { dispatch(loadRepos(userId)); }
  };
}

// Connected Component
let App = connect(
  mapStateToProps,
  mapDispatchToProps
)(ReactComp);

React.render(
  <Provider store={store}>
    {() => <App />}
  </Provider>,
  document.getElementById('root')
);
