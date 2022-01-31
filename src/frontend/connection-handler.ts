import {
    ConfirmationBaseMessage,
    GetPanelResponse,
    ListDevicesResponse,
    Message,
    MessageType,
    Response,
    SelectDeviceResponse,
    UpdatePanelResponse,
} from '../api';
import { Device, Panel } from '../common';

export type ResponseHandler = (msg: Response) => any | Promise<any>;
export type CloseHandler = (manual: boolean) => any;
type ResponseFilter = (response: ConfirmationBaseMessage) => boolean;
const defaultFilter: (msg: Message) => ResponseFilter =
    (msg) =>
        (response) => response.type === MessageType.CONFIRMATION
            && response.confirmationType === msg.type;

export class ConnectionHandler {
    private static socket: WebSocket;

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

    private static async handleIncomingMessage(message: Response) {
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

                ConnectionHandler.socket.addEventListener('open', event => {
                    resolve();
                });

                ConnectionHandler.socket.addEventListener('message', async event => {
                    ConnectionHandler.handleIncomingMessage(JSON.parse(event.data));
                });

                ConnectionHandler.socket.addEventListener('close', () => {
                    ConnectionHandler.disconnect(false);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    static disconnect(manual: boolean = true) {
        if (ConnectionHandler.socket == null) {
            return;
        }

        ConnectionHandler.socket = null;

        for (const handler of ConnectionHandler.closeHandlers) {
            try {
                handler(manual);
            } catch (e) {
                console.error(e);
            }
        }
    }

    static send(msg: Message, filter: ResponseFilter = null): Promise<Message> {
        if (filter == null) {
            filter = defaultFilter(msg);
        }
        ConnectionHandler.socket.send(JSON.stringify(msg));
        return new Promise((resolve, reject) => {
            let finished = false;
            const listener = (event) => {
                try {
                    const res: Response = JSON.parse(event.data);
                    if (res.type !== MessageType.CONFIRMATION || !filter(res)) {
                        return;
                    }

                    if (!res.confirmationSuccess) {
                        reject('server rejected request!');
                    } else {
                        finished = true;
                        resolve(res);
                    }
                } catch (e) { }
            };
            ConnectionHandler.socket.addEventListener('message', listener);

            setTimeout(() => {
                ConnectionHandler.socket.removeEventListener('message', listener);
                if (!finished) {
                    reject('timeout reached, no response!');
                }
            }, 5000);
        });
    }

    static listDevices(): Promise<Device[]> {
        return ConnectionHandler.send({
            type: MessageType.LIST_DEVICES,
        }).then((msg: ListDevicesResponse) => msg.devices);
    }

    static selectDevice(device: string): Promise<SelectDeviceResponse> {
        return ConnectionHandler.send({
            type: MessageType.SELECT_DEVICE,
            devicePath: device,
        }) as Promise<SelectDeviceResponse>;
    }

    static enableMeassurements(enabled: boolean): Promise<void> {
        return ConnectionHandler.send({
            type: MessageType.MEASSUREMENT,
            meassureEnable: enabled,
        }).then(() => {});
    }

    static getSinglePanel(index: number): Promise<Panel> {
        return ConnectionHandler.send({
            type: MessageType.GET_PANEL,
            panelIndex: index,
        }, res => res.confirmationType === MessageType.GET_PANEL
            && (res as GetPanelResponse).panelIndex === index
        )
            .then((msg: GetPanelResponse) => msg.settings);
    }

    static updateSinglePanel(index: number, settings: Panel): Promise<void> {
        return ConnectionHandler.send({
            type: MessageType.UPDATE_PANEL,
            panelIndex: index,
            settings,
        }, res => res.confirmationType === MessageType.GET_PANEL
            && (res as UpdatePanelResponse).panelIndex === index
        ).then(() => {});
    }

    static resetSettings(): Promise<void> {
        return ConnectionHandler.send({
            type: MessageType.RESET_SETTINGS,
        }).then(() => {});
    }

    static saveSettings(): Promise<void> {
        return ConnectionHandler.send({
            type: MessageType.SAVE_SETTINGS,
        }).then(() => {});
    }
}