import fastify from 'fastify';
import fastifyWs from 'fastify-websocket';
import SerialPort from 'serialport';

import { Message, MessageType, Request, Response, SelectDeviceResponse } from '../../common/src/api';
import { Command } from '../../common/src/common';
import { BoardConnection } from './board-connection';
import { BackendArgments } from './models/options';

export function createWebSocketServer(args: BackendArgments) {
    const app = fastify({ logger: { prettyPrint: true } });
    
    app.register(fastifyWs);
    
    app.get('/', { websocket: true }, wsConn => {
    
        wsConn.socket.on('message', rawData => {
            try {
                handleIncomingMessage(JSON.parse(rawData.toString()));
            } catch (e) {
                console.log(e);
            }
        });
    
        wsConn.socket.on('close', () => {
            serialDisconnect(true);
        });
    
        let serialConn: SerialPort | null = null;
        let board: BoardConnection | null = null;
        let currentDevice: string;
    
        function respond(message: Message, successful: boolean = true, data: Partial<Message> = {}) {
            send({
                ...data,
                type: MessageType.CONFIRMATION,
                confirmationType: message.type as any,
                confirmationSuccess: successful,
            });
        }
    
        function send(message: Response) {
            wsConn.socket.send(JSON.stringify(message));
        }
    
        function serialDisconnect(silent: boolean = false) {
            console.log('Device disconnected!');
            if (!silent) {
                send({ type: MessageType.DEVICE_DISCONNECT });
            }
            if (board != null) {
                board.close();
            }
            serialConn = null;
            board = null;
        }
    
        async function handleIncomingMessage(msg: Request) {
            switch (msg.type) {
                case MessageType.LIST_DEVICES:
                    try {
                        respond(msg, true, {
                            devices: await SerialPort.list()
                        });
                    } catch (err) {
                        console.error(err);
                        respond(msg, false);
                    }
                    break;
    
                case MessageType.SELECT_DEVICE:
                    if (msg.devicePath !== currentDevice) {
                        try {
                            if (serialConn != null) {
                                serialConn.off('close', serialDisconnect);
                                await new Promise<void>((resolve, reject) => serialConn.close(err => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                }));
                            }
                        } catch (err) {
                            console.log(err);
                            respond(msg, false);
                            break;
                        }
    
                        serialConn = null;
                        board = null;
                    }
    
                    if (msg.devicePath == null || msg.devicePath === currentDevice) {
                        respond(msg);
                        break;
                    }
    
                    try {
                        serialConn = new SerialPort(msg.devicePath, { baudRate: 9600, autoOpen: false });
                        board = new BoardConnection(serialConn);
                        currentDevice = msg.devicePath;
    
                        board.addMessageHandler(msg => {
                            if (msg.startsWith(`${Command.MEASURE} v`)) {
                                const [index, value] = msg.substring(4).split(' ');
    
                                send({
                                    type: MessageType.MEASUREMENT_VALUE,
                                    measurePanelIndex: parseInt(index, 10),
                                    measureValue: parseInt(value, 10),
                                });
                            }/* else {
                                wsConn.socket.send(JSON.stringify({
                                    type: 'trace',
                                    data: msg.trim(),
                                }));
                            }*/
                        });
    
                        await new Promise<void>((resolve, reject) => {
                            serialConn.open(async err => {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                resolve();
                            });
                        });
    
                        serialConn.on('close', serialDisconnect);
    
                        const [panels, layout] = await Promise.all([
                            board.getPanels(),
                            board.getPadLayout()
                        ]);
    
                        const res: SelectDeviceResponse = {
                            type: MessageType.CONFIRMATION,
                            confirmationType: MessageType.SELECT_DEVICE,
                            confirmationSuccess: true,
                            panels,
                            panelCount: panels.length,
                            layout,
                        };
    
                        send(res);                    
                    } catch (err) {
                        console.error(err);
                        serialDisconnect(true);
                        respond(msg, false);
                    }
    
                    break;
    
                case MessageType.GET_MEASUREMENT:
                    if (board == null) {
                        respond(msg, false);
                        break;
                    }
    
                    try {
                        const isEnabled = await board.isMeasurementEnabled();
                        respond(msg, true, {
                            isEnabled,
                        });
                    } catch (err) {
                        console.error(err);
                        respond(msg, false);
                    }
    
                    break;
    
                case MessageType.SET_MEASUREMENT:
                    if (board == null) {
                        respond(msg, false);
                        break;
                    }
    
                    try {
                        const isEnabled = await board.setMeasurement(msg.measureEnable);
                        respond(msg, true, {
                            isEnabled,
                        });
                    } catch (err) {
                        console.error(err);
                        respond(msg, false);
                    }
    
                    break;
    
                case MessageType.GET_PANEL:
                    if (board == null) {
                        respond(msg, false);
                        break;
                    }
    
                    try {
                        const settings = await board.getPanel(msg.panelIndex);
                        respond(msg, true, {
                            panelIndex: msg.panelIndex,
                            settings,
                        });
                    } catch (err) {
                        console.error(err);
                        respond(msg, false, {
                            panelIndex: msg.panelIndex,
                            settings: null,
                        });
                    }
                    break;
    
                case MessageType.UPDATE_PANEL:
                    if (board == null) {
                        respond(msg, false);
                        break;
                    }
    
                    try {
                        await board.writePanel(msg.panelIndex, msg.settings);
                        respond(msg, true, { panelIndex: msg.panelIndex });
                    } catch (err) {
                        console.error(err);
                        respond(msg, false, { panelIndex: msg.panelIndex });
                    }
                    break;
    
                case MessageType.RESET_SETTINGS:
                    if (board == null) {
                        respond(msg, false);
                        break;
                    }
    
                    try {
                        await board.reset();
                        respond(msg);
                    } catch (err) {
                        console.error(err);
                        respond(msg, false);
                    }
                    break;
    
                case MessageType.SAVE_SETTINGS:
                    if (board == null) {
                        respond(msg, false);
                        break;
                    }
    
                    try {
                        await board.save();
                        respond(msg);
                    } catch (err) {
                        console.error(err);
                        respond(msg, false);
                    }
                    break;
    
                case MessageType.GET_LAYOUT:
                    if (board == null) {
                        respond(msg, false);
                        break;
                    }
    
                    try {
                        const layout = await board.getPadLayout();
                        respond(msg, true, {
                            layout
                        });
                    } catch (err) {
                        console.error(err);
                        respond(msg, false);
                    }
                    break;
            }
        }
    });

    app.listen(args.port, err => {
        if (err) {
            console.log(err);
        }
    });

    const promise = new Promise<void>(resolve => {
        app.addHook('onClose', () => {
            resolve();
        });
    });

    return { app, promise };
}
