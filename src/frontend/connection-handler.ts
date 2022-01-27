import { Device, ListDevicesResponse, Message, MessageType, Response } from '../api';

export type ResponseHandler = (msg: Response) => any | Promise<any>;
export type CloseHandler = (manual: boolean) => any;

export class ConnectionHandler {
    private static socket: WebSocket;

    private static responseHandlers: ResponseHandler[] = [];
    private static closeHandlers: CloseHandler[] = [];

    private constructor() { }

    static addMesssageHandler(handler: ResponseHandler) {
        if (!ConnectionHandler.responseHandlers.includes(handler)) {
            ConnectionHandler.responseHandlers.push(handler);
        }
    }

    static removeMesssageHandler(handler: ResponseHandler) {
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

    static send(msg: Message): Promise<Message> {
        ConnectionHandler.socket.send(JSON.stringify(msg));
        return new Promise((resolve, reject) => {
            let finished = false;
            const listener = (event) => {
                try {
                    const res: Message = JSON.parse(event.data);
                    if (res.type !== 'confirmation' || res.confirmationType !== msg.type) {
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

    static selectDevice(device: string) {
        return ConnectionHandler.send({
            type: MessageType.SELECT_DEVICE,
            devicePath: device,
        });
    }
}