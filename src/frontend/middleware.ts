import { Middleware } from 'redux';

import { ConnectionHandler } from './connection-handler';
import { disconnectFromBackend, setConnectedToBackend } from './store/backend';
import { setDevices, setSelectedDevice } from './store/device';
import { RootState } from './store/root';
import { openToast } from './store/toast';

export const connectionHandlerMiddleware: Middleware<{}, RootState> = storeApi => next => action => {
    switch (action.type) {
        case 'backend/connect':
            ConnectionHandler.connect(action.payload)
                .then(() => ConnectionHandler.listDevices())
                .then(devices => {
                    storeApi.dispatch(setConnectedToBackend());
                    storeApi.dispatch(setDevices(devices));
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
    }

    return next(action);
};