import { combineReducers } from '@reduxjs/toolkit';

import backendReducer from './backend';
import deviceSlice from './device';
import toastReducer from './toast';

export const rootReducer = combineReducers({
    backend: backendReducer,
    toast: toastReducer,
    device: deviceSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
