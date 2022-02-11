import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { MessageType } from '../../common/src/api';
import { App } from './components/App';
import { ConnectionHandler } from './connection-handler';
import { store } from './store';
import { disconnectFromBackend } from './store/backend';
import { devices, mesasurements, panels, selectPanel, setSelectedDevice } from './store/device';
import { openToast } from './store/toast';

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

(() => {
    function disconnectDevice() {
        store.dispatch(devices([]));
        store.dispatch(setSelectedDevice(null));
        store.dispatch(panels([]));
        store.dispatch(selectPanel(null));
    }

    ConnectionHandler.addCloseHandler(manual => {
        store.dispatch(disconnectFromBackend());
        disconnectDevice();
    
        if (!manual) {
            store.dispatch(openToast({
                title: 'Server disconnected!',
                message: 'The connection to the server has been unexpectedly disconnected!',
                status: 'critical',
                expire: 5_000,
            }));
        }
    });
    
    ConnectionHandler.addResponseHandler(response => {
        switch (response.type) {
            case MessageType.CONFIRMATION:
                switch (response.confirmationType) {
                    case MessageType.LIST_DEVICES:
                        store.dispatch(devices(response.devices));
                        break;
                    case MessageType.SET_MEASUREMENT:
                        store.dispatch(mesasurements(response.isEnabled));
                        break;
                }
                break;
    
            case MessageType.DEVICE_DISCONNECT:
                // Request a new list of devices to remove the currently removed one
                ConnectionHandler.listDevices()
                    .then(loadedDevices => store.dispatch(devices(loadedDevices)));
                disconnectDevice();
                store.dispatch(openToast({
                    title: 'Device disconnected!',
                    message: 'The device has unexpectedly disconnected!',
                    status: 'critical',
                    expire: 5_000,
                }));
                break;
        }
    });
})();


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
