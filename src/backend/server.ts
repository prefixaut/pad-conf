import fastify from 'fastify';
import fastifyWs from 'fastify-websocket';
import SerialPort from 'serialport';

import { Message, MessageType, Request, Response, SelectDeviceResponse } from '../api';
import { Command } from '../common';
import { BoardConnection } from './board-connection';

const app = fastify({ logger: { prettyPrint: true } });

app.register(fastifyWs);

app.get('/', { websocket: true }, (wsConn, req) => {

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
        serialConn = null;
        board = null;
    }

    async function handleIncomingMessage(msg: Request) {
        switch (msg.type) {
            case MessageType.LIST_DEVICES:
                respond(msg, true, {
                    devices: await SerialPort.list()
                });
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
                        respond(msg, false);
                        break;
                    }

                    serialConn = null;
                    board = null;
                }

                if (msg.devicePath == null) {
                    respond(msg);
                    break;
                }

                try {
                    serialConn = new SerialPort(msg.devicePath, { baudRate: 9600 });
                    board = new BoardConnection(serialConn);
                    currentDevice = msg.devicePath;

                    serialConn.on('data', data => {
                        const msg = data.toString();
                        if (msg.startsWith(Command.MEASSURE_VALUE)) {
                            const [index, value] = msg.substring(2).split(' ');

                            send({
                                type: MessageType.MEASSUREMENT,
                                meassurePanelIndex: parseInt(index, 10),
                                meassureValue: parseInt(value, 10),
                            });
                        } else {
                            wsConn.socket.send(JSON.stringify({
                                type: 'trace',
                                data: msg,
                            }));
                        }
                    });

                    serialConn.on('open', async () => {
                        try {
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
                            serialDisconnect(true);
                            respond(msg, false);
                        }
                    });

                    serialConn.on('error', err => {
                        console.error('Unknown error from device!', err);
                    });

                    serialConn.on('close', serialDisconnect);

                } catch (err) {
                    console.error(err);
                    respond(msg, false);
                }

                break;

            case MessageType.MEASSUREMENT:
                if (board == null) {
                    respond(msg, false);
                    break;
                }

                respond(msg, await board.setMeassurement(msg.meassureEnable));
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
                    respond(msg, false);
                }
                break;

            case MessageType.UPDATE_PANEL:
                if (board == null) {
                    respond(msg, false);
                    break;
                }

                try {
                    await board.writePanel(msg.panelIndex, msg.settings);
                    respond(msg);
                } catch (err) {
                    respond(msg, false);
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
                    respond(msg, false);
                }
                break;

            case MessageType.RESET_SETTINGS:
                if (board == null) {
                    respond(msg, false);
                    break;
                }

                try {
                    await board.save();
                    respond(msg);
                } catch (err) {
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
                    respond(msg, false);
                }
                break;
        }
    }

    wsConn.socket.on('message', rawData => {
        try {
            handleIncomingMessage(JSON.parse(rawData.toString()));
        } catch (e) {
            console.log(e);
        }
    });

    wsConn.socket.on('close', () => {
        serialConn?.close();
    });
});

app.listen(8000, err => {
    if (err) {
        console.log(err);
    }
});
