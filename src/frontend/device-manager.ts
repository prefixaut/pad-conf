import { Device, Message } from '../api';

export type MessageHandler = (msg: Message) => any | Promise<any>;
export type CloseHandler = () => any;

export class DeviceManager {
    private static socket: WebSocket;

    private static messageHandlers: MessageHandler[] = [];
    private static closeHandlers: CloseHandler[] = [];

    private constructor() {}

    static addMesssageHandler(handler: MessageHandler) {
        if (!DeviceManager.messageHandlers.includes(handler)) {
            DeviceManager.messageHandlers.push(handler);
        }
    }

    static removeMesssageHandler(handler: MessageHandler) {
        const index = DeviceManager.messageHandlers.indexOf(handler);
        if (index !== -1) {
            DeviceManager.messageHandlers = [
                ...DeviceManager.messageHandlers.slice(0, index),
                ...DeviceManager.messageHandlers.slice(index + 1),
            ];
        }
    }

    static addCloseHandler(handler: CloseHandler) {
        if (!DeviceManager.closeHandlers.includes(handler)) {
            DeviceManager.closeHandlers.push(handler);
        }
    }

    static removeCloseHandler(handler: CloseHandler) {
        const index = DeviceManager.closeHandlers.indexOf(handler);
        if (index !== -1) {
            DeviceManager.closeHandlers = [
                ...DeviceManager.closeHandlers.slice(0, index),
                ...DeviceManager.closeHandlers.slice(index + 1),
            ];
        }
    }

    static connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                DeviceManager.socket = new WebSocket(`ws://localhost:8000/`);
                
                DeviceManager.socket.addEventListener('open', event => {
                    resolve();
                });
            
                DeviceManager.socket.addEventListener('message', async event => {
                    const msg = JSON.parse(event.data);

                    for (const handler of DeviceManager.messageHandlers) {
                        try {
                            if (typeof (handler as any).then === 'function') {
                                await handler(msg);
                            } else {
                                handler(msg);
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                });
        
                DeviceManager.socket.addEventListener('close', () => {
                    DeviceManager.disconnect();
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    static disconnect() {
        if (DeviceManager.socket == null) {
            return;
        }

        DeviceManager.socket = null;
                    
        for (const handler of DeviceManager.closeHandlers) {
            try {
                handler();
            } catch (e) {
                console.error(e);
            }
        }
    }

    static send(msg: Message): Promise<Message> {
        DeviceManager.socket.send(JSON.stringify(msg));
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
                } catch (e) {}
            };
            DeviceManager.socket.addEventListener('message', listener);

            setTimeout(() => {
                DeviceManager.socket.removeEventListener('message', listener);
                if (!finished) {
                    reject('timeout reached, no response!');
                }
            }, 5000);
        });
    }

    static refresh() {
        return DeviceManager.send({
            type: 'refresh',
        });
    }

    static listDevices(): Promise<Device[]> {
        return DeviceManager.send({
            type: 'list',
        }).then(msg => msg.devices);
    }

    static selectDevice(device: string) {
        return DeviceManager.send({
            type: 'select',
            devicePath: device,
        });
    }

    static sendCommand(command: string) {
        return DeviceManager.send({
            type: 'command',
            command,
        });
    }
}