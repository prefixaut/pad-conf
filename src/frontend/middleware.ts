import { Middleware } from 'redux';

import { ConnectionHandler } from './connection-handler';
import { disconnectFromBackend, setConnectedToBackend } from './store/backend';
import { devices } from './store/device';
import { RootState } from './store/root';
import { closeToast, openToast } from './store/toast';

export const connectionHandlerMiddleware: Middleware<{}, RootState> = storeApi => next => action => {
    switch (action.type) {
        case 'backend/connect':
            ConnectionHandler.connect(action.payload)
                .then(() => ConnectionHandler.listDevices())
                .then(loadedDevices => {
                    storeApi.dispatch(setConnectedToBackend());
                    storeApi.dispatch(devices(loadedDevices));
                })
                .catch(error => {
                    console.log(error);
                    storeApi.dispatch(openToast({
                        title: 'Server not reached',
                        message: 'Connection to server could not be established!',
                        status: 'critical',
                    }));

                    storeApi.dispatch(disconnectFromBackend());
                });
            break;
        
        case 'device/selectDevice':
            ConnectionHandler.selectDevice(action.payload?.path);
            break;
    }

    return next(action);
};

export const utilMiddleware: Middleware<{}, RootState> = storeApi => next => action => {
    switch (action.type) {
        case 'toast/open':
            if (action.payload.expire > 0) {
                setTimeout(() => {
                    storeApi.dispatch(closeToast(action.payload));
                }, action.payload.expire);
            }
            break;
    }

    return next(action);
};