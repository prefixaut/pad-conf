import { Middleware } from 'redux';

import { ConnectionHandler } from './connection-handler';
import { disconnectFromBackend, setConnectedToBackend } from './store/backend';
import { devices, deviceSelected, mesasurements } from './store/device';
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
            ConnectionHandler.selectDevice(action.payload?.path).then(res => {
                ConnectionHandler.isMeasurementEnabled().then(measureEnabled => {
                    storeApi.dispatch(mesasurements(measureEnabled));
                    storeApi.dispatch(deviceSelected({ layout: res.layout, panels: res.panels }));
                });
            });
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