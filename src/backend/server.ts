import fastify from 'fastify';
import fastifyWs from 'fastify-websocket';
import SerialPort from 'serialport';

import { Message, MessageType, Response } from '../api';

const app = fastify({ logger: { prettyPrint: true } });

app.register(fastifyWs);

app.get('/', { websocket: true }, (wsConn, req) => {

    let serialConn: SerialPort | null = null;

    function respond(message: Message, successful: boolean = true, data: Partial<Message> = {}) {
        send({
            ...data,
            type: MessageType.CONFIRMATION,
            confirmationType: message.type,
            confirmationSuccess: successful,
        });
    }

    function send(message: Response) {
        wsConn.socket.send(JSON.stringify(message));
    }

    function serialDisconnect() {
        send({ type: MessageType.DEVICE_DISCONNECT });
        serialConn = null;
    }

    wsConn.socket.on('message', async rawData => {
        try {
            const msg: Message = JSON.parse(rawData.toString());
            switch (msg.type) {
                case MessageType.LIST_DEVICES:
                    respond(msg, true, {
                        devices: await SerialPort.list()
                    });
                    break;

                case MessageType.SELECT_DEVICE:
                    if (!msg.devicePath) {
                        if (serialConn != null) {
                            serialConn.off('close', serialDisconnect);
                            serialConn.close();
                        }
                        serialConn = null;
                        respond(msg);
                        break;
                    }

                    try {
                        serialConn = new SerialPort(msg.devicePath, { baudRate: 9600 });

                        serialConn.on('data', data => {
                            wsConn.socket.send(JSON.stringify({
                                type: 'trace',
                                data: data.toString()
                            }));
                        });

                        serialConn.on('close', serialDisconnect);

                        respond(msg);
                    } catch (err) {
                        console.error(err);
                        respond(msg, false);
                    }

                    break;
            }
        } catch (e) {

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