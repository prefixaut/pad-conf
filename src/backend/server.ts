import SerialPort from 'serialport';
import fastify from 'fastify';
import fastifyWs from 'fastify-websocket';

import { Message } from '../api';

const app = fastify({ logger: { prettyPrint: true } });

app.register(fastifyWs);

app.get('/', { websocket: true }, (wsConn, req) => {
    
    let serialConn: SerialPort | null = null;
    let devices: SerialPort.PortInfo[] = [];

    function respond(message: Message, successful: boolean = true, data: Partial<Message> = {}) {
        send({
            ...data,
            type: 'confirmation',
            confirmationType: message.type,
            confirmationSuccess: successful,
        });
    }

    function send(message: Message) {
        wsConn.socket.send(JSON.stringify(message));
    }
    
    wsConn.socket.on('message', async rawData => {
        try {
            const msg: Message = JSON.parse(rawData.toString());
            switch (msg.type) {
                case 'refresh':
                    devices = await SerialPort.list();
                    respond(msg);
                    break;

                case 'list':
                    respond(msg, true, {
                        devices,
                    });
                    break;

                case 'select':
                    if (!msg.devicePath) {
                        if (serialConn != null) {
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