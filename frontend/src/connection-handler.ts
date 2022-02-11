import {
    ConfirmationBaseMessage,
    GetMeasurementResponse,
    GetPanelResponse,
    ListDevicesResponse,
    Message,
    MessageType,
    Response,
    SelectDeviceResponse,
    UpdatePanelResponse,
} from '../../common/src/api';
import { Device, Panel } from '../../common/src/common';

export type ResponseHandler = (msg: Response) => any | Promise<any>;
export type CloseHandler = (manual: boolean) => any;
type ResponseFilter = (response: ConfirmationBaseMessage) => boolean;
const defaultFilter: (msg: Message) => ResponseFilter =
    (msg) =>
        (response) => response.type === MessageType.CONFIRMATION
            && response.confirmationType === msg.type;

export class ConnectionHandler {
    private static socket: WebSocket | null;
    private static socketCloseHandler: any;
    private static socketOpenHandler: any;

    private static responseHandlers: ResponseHandler[] = [];
    private static closeHandlers: CloseHandler[] = [];

    private constructor() { }

    static addResponseHandler(handler: ResponseHandler) {
        if (!ConnectionHandler.responseHandlers.includes(handler)) {
            ConnectionHandler.responseHandlers.push(handler);
        }
    }

    static removeResponseHandler(handler: ResponseHandler) {
        const index = ConnectionHandler.responseHandlers.indexOf(handler);
        if (index !== -1) {
            ConnectionHandler.responseHandlers = [
                ...ConnectionHandler.responseHandlers.slice(0, index),
                ...ConnectionHandler.responseHandlers.slice(index + 1),
            ];
        }
    }

    static addCloseHandler(handler: CloseHandler) {
        if (!ConnectionHandler.closeHandlers.includes(handler)) {
            ConnectionHandler.closeHandlers.push(handler);
        }
    }

    static removeCloseHandler(handler: CloseHandler) {
        const index = ConnectionHandler.closeHandlers.indexOf(handler);
        if (index !== -1) {
            ConnectionHandler.closeHandlers = [
                ...ConnectionHandler.closeHandlers.slice(0, index),
                ...ConnectionHandler.closeHandlers.slice(index + 1),
            ];
        }
    }

    static isConnected() {
        return ConnectionHandler.socket != null;
    }

    static isMeasurementEnabled(): Promise<boolean> {
        return ConnectionHandler.send({
            type: MessageType.GET_MEASUREMENT,
        }).then(msg => (msg as GetMeasurementResponse).isEnabled);
    }

    private static async handleIncomingMessage(event: MessageEvent<any>) {
        const message: Response = JSON.parse(event.data);

        for (const handler of ConnectionHandler.responseHandlers) {
            try {
                if (typeof (handler as any).then === 'function') {
                    await handler(message);
                } else {
                    handler(message);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    static connect(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                ConnectionHandler.socket = new WebSocket(url);

                ConnectionHandler.socketOpenHandler = () => {
                    resolve();
                };
                ConnectionHandler.socketCloseHandler = () => {
                    ConnectionHandler.disconnect(false);
                };

                ConnectionHandler.socket.addEventListener('open', ConnectionHandler.socketOpenHandler);
                ConnectionHandler.socket.addEventListener('message', ConnectionHandler.handleIncomingMessage);
                ConnectionHandler.socket.addEventListener('close', ConnectionHandler.socketCloseHandler);
            } catch (e) {
                reject(e);
            }
        });
    }

    static disconnect(manual: boolean = true) {
        if (ConnectionHandler.socket == null) {
            return;
        }

        if (ConnectionHandler.socket != null) {
            ConnectionHandler.socket.removeEventListener('open', ConnectionHandler.socketOpenHandler);
            ConnectionHandler.socket.removeEventListener('message', ConnectionHandler.handleIncomingMessage);
            ConnectionHandler.socket.removeEventListener('close', ConnectionHandler.socketCloseHandler);
            if (ConnectionHandler.socket.readyState === WebSocket.CONNECTING || ConnectionHandler.socket.readyState === WebSocket.OPEN) {
                try {
                    ConnectionHandler.socket.close(manual ? 1000 : 1006);
                } catch (err) {
                    console.error('Error while closing WebSocket connection', err);
                }
            }
        }

        ConnectionHandler.socket = null;
        ConnectionHandler.socketOpenHandler = null;
        ConnectionHandler.socketCloseHandler = null;

        for (const handler of ConnectionHandler.closeHandlers) {
            try {
                handler(manual);
            } catch (e) {
                console.error(e);
            }
        }
    }

    static send(msg: Message, filter: ResponseFilter | null = null): Promise<Message> {
        if (ConnectionHandler.socket == null) {
            return Promise.reject('No open connection!');
        }

        if (filter == null) {
            filter = defaultFilter(msg);
        }

        ConnectionHandler.socket.send(JSON.stringify(msg));

        return new Promise((resolve, reject) => {
            let finished = false;
            let timeoutId: number;

            const listener = (event: MessageEvent<string>) => {
                try {
                    const res: Response = JSON.parse(event.data);
                    if (res.type !== MessageType.CONFIRMATION || filter == null || !filter(res)) {
                        return;
                    }

                    if (!res.confirmationSuccess) {
                        reject('server rejected request!');
                    } else {
                        finished = true;
                        clearTimeout(timeoutId);
                        resolve(res);
                    }
                } catch { }
            };

            if (ConnectionHandler.socket != null) {
                ConnectionHandler.socket.addEventListener('message', listener);
            }

            timeoutId = window.setTimeout(() => {
                if (ConnectionHandler.socket != null) {
                    ConnectionHandler.socket.removeEventListener('message', listener);
                }
                if (!finished) {
                    reject('timeout reached, no response!');
                }
            }, 5000);
        });
    }

    static listDevices(): Promise<Device[]> {
        return ConnectionHandler.send({
            type: MessageType.LIST_DEVICES,
        }).then(msg => (msg as ListDevicesResponse).devices);
    }

    static selectDevice(device: string): Promise<SelectDeviceResponse> {
        return ConnectionHandler.send({
            type: MessageType.SELECT_DEVICE,
            devicePath: device,
        }) as Promise<SelectDeviceResponse>;
    }

    static enableMeasurements(enabled: boolean): Promise<void> {
        return ConnectionHandler.send({
            type: MessageType.SET_MEASUREMENT,
            measureEnable: enabled,
        }).then(() => { });
    }

    static getSinglePanel(index: number): Promise<Panel> {
        return ConnectionHandler.send({
            type: MessageType.GET_PANEL,
            panelIndex: index,
        }, res => res.confirmationType === MessageType.GET_PANEL
            && (res as GetPanelResponse).panelIndex === index
        )
            .then(msg => (msg as GetPanelResponse).settings);
    }

    static updateSinglePanel(index: number, settings: Panel): Promise<void> {
        return ConnectionHandler.send({
            type: MessageType.UPDATE_PANEL,
            panelIndex: index,
            settings,
        }, res => res.confirmationType === MessageType.UPDATE_PANEL
            && (res as UpdatePanelResponse).panelIndex === index
        ).then(() => { });
    }

    static resetSettings(): Promise<void> {
        return ConnectionHandler.send({
            type: MessageType.RESET_SETTINGS,
        }).then(() => { });
    }

    static saveSettings(): Promise<void> {
        return ConnectionHandler.send({
            type: MessageType.SAVE_SETTINGS,
        }).then(() => { });
    }
}