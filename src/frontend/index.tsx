import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { ListDevicesResponse, MessageType } from '../api';
import { App } from './components/App';
import { ConnectionHandler } from './connection-handler';
import { store } from './store';
import { disconnectFromBackend } from './store/backend';
import { setDevices, setSelectedDevice } from './store/device';
import { openToast } from './store/toast';

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

ConnectionHandler.addCloseHandler(manual => {
    store.dispatch(disconnectFromBackend());
    store.dispatch(setSelectedDevice(null));
    store.dispatch(setDevices([]));

    if (!manual) {
        store.dispatch(openToast({
            title: 'Server disconnected!',
            message: 'The connection to the server has been unexpectedly disconnected!',
            status: 'critical',
        }));
    }
});

ConnectionHandler.addMesssageHandler(message => {
    switch (message.type) {
        case MessageType.CONFIRMATION:
            switch (message.confirmationType) {
                case MessageType.LIST_DEVICES:
                    store.dispatch(setDevices((message as ListDevicesResponse).devices));
                    break;
            }
            break;

        case MessageType.DEVICE_DISCONNECT:
            // Request a new list of devices to remove the currently removed one
            ConnectionHandler.listDevices()
                .then(devices => store.dispatch(setDevices(devices)));
            store.dispatch(setSelectedDevice(null));
            store.dispatch(openToast({
                title: 'Device disconnected!',
                message: 'The device has unexpectedly disconnected!',
                status: 'critical',
            }));
            break;
    }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
