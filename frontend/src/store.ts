import { applyMiddleware, createStore } from '@reduxjs/toolkit';

import { connectionHandlerMiddleware, utilMiddleware } from './middleware';
import { rootReducer } from './store/root';

export const store = createStore(rootReducer, applyMiddleware(connectionHandlerMiddleware, utilMiddleware));
export type AppDispatch = typeof store.dispatch;
