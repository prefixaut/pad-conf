import { applyMiddleware, createStore, Store } from '@reduxjs/toolkit';

import { connectionHandlerMiddleware } from './middleware';
import { rootReducer } from './store/root';

export const store = createStore(rootReducer, applyMiddleware(connectionHandlerMiddleware));
export type AppDispatch = typeof store.dispatch;
