/**
 * Reducer function to handle pending requests.
 * @param  {Object} state  Existing state object.
 * @param  {Object} action Incoming action:
 *                         - Ations with the meta.httpRequest property are examined.
 *                         - The meta.httpRequest.url property is added or removed
 *                           from the current state depending on if the meta.httpRequest.done
 *                           property is set.
 * @return {Object}        The new state.
 */
export function requestsReducer(state = {}, action) {
  if (!action.meta || !action.meta.httpRequest || !action.meta.httpRequest.url) {
    return state;
  }
  if (action.meta.httpRequest.done) {
    // Remove this request from the state
    let newState = { ...state };
    delete newState[action.meta.httpRequest.url];
    return newState;
  }
  else {
    // Add this request to the state
    return { ...state, [action.meta.httpRequest.url]: true };
  }
}

/**
 * Creates a Redux middleware function when called.
 * @param  {Function} selectorFunc A function to select the location in the store's state tree where
 *                                   the requests reducer keeps it's state.
 * @return {Function}              A middleware function that will only dispatch the action if the
 *                                   action.meta.httpRequest.done property is false, and the
 *                                   meta.httpRequest.url is not already in flight.
 */
export function createRequestMiddleware(selectorFunc = state => state.requests) {
  return store => next => action => {
    // Cancel HTTP request if there is already one pending for this URL
    if (action.meta && action.meta.httpRequest && !action.meta.httpRequest.done) {
      const requests = selectorFunc(store.getState());
      if (requests[action.meta.httpRequest.url]) {
        // There is a request for this URL in flight already!
        // (Ignore the action)
        return;
      }
    }
    return next(action);
  };
}
