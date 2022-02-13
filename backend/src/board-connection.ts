import SerialPort from 'serialport';

import { Command, PadLayout, Panel } from '../../common/src/common';

type ResponseFilter = (msg: string) => boolean;
type MessageHandler = (msg: string) => any;

export class BoardConnection {
    
    private serialHandler;
    private messageBuffer = '';
    private messageHandlers: MessageHandler[] = [];

    constructor(
        private connection: SerialPort,
        private timeout: number = 5_000,
    ) {
        this.serialHandler = event => this.handleSerialData(event);
        this.connection.on('data', this.serialHandler);
    }

    private handleSerialData(event) {
        const messages = [];
        let msgIndex = 0;
        const data = this.messageBuffer + event.toString();

        for (let i = 0; i < data.length; i++) {
            if (data[i] == '\r') {
                continue;
            }
            if (data[i] == '\n') {
                messages.push(data.substring(msgIndex, i).trim());
                msgIndex = i+1;
            }
        }

        this.messageBuffer = data.substring(msgIndex);

        for (const msg of messages) {
            for (const handler of this.messageHandlers) {
                try {
                    handler(msg);
                } catch {}
            }
        }
    }

    public close() {
        try {
            this.connection.off('data', this.serialHandler);
        } catch {}
        this.messageHandlers = [];
        this.messageBuffer = '';
    }

    public addMessageHandler(handler: MessageHandler) {
        if (this.messageHandlers.includes(handler)) {
            return;
        }
        this.messageHandlers.push(handler);
    }

    public removeMessageHandler(handler: MessageHandler) {
        const index = this.messageHandlers.indexOf(handler);
        if (index === -1) {
            return;
        }
        this.messageHandlers = [
            ...this.messageHandlers.slice(0, index),
            ...this.messageHandlers.slice(index + 1),
        ];
    }

    private sendAndWait(command: string, filter: ResponseFilter, timeout: number = this.timeout): Promise<string> {
        return new Promise((resolve, reject) => {
            let timer = null;
            let resolved = false;

            const handler = (msg) => {
                if (!filter(msg)) {
                    return;
                }
                console.log(`Command "${command}" received confirmation "${msg}"!`);
                resolved = true;
                if (timer != null) {
                    clearTimeout(timer);
                }
                this.connection.off('data', handler);
                resolve(msg);
            };

            this.addMessageHandler(handler);
            this.send(command);

            if (!resolved) {
                timer = setTimeout(() => {
                    this.removeMessageHandler(handler);
                    const msg = `Command "${command}" reched a timeout!`;
                    console.error(msg);
                    reject(msg);
                }, timeout);
            }
        });
    }

    public send(command: string) {
        command = command.trim();
        console.log(`Sending command "${command}" ...`);
        this.connection.write(command + '\n', this.writeHandler(command));
    }

    private writeHandler(command) {
        return (err) => {
            if (err) {
                console.error(`Command "${command} could not be sent!"`, err);
            } else {
                console.log(`Command "${command}" successfully sent!`);
            }
        }
    }

    isDebugEnabled(timeout = this.timeout): Promise<boolean> {
        return this.sendAndWait(Command.DEBUG, msg => msg.startsWith(Command.DEBUG), timeout)
            .then(msg => msg.substring(2) === '1');
    }

    setDebug(value: boolean, timeout = this.timeout): Promise<boolean> {
        return this.sendAndWait(`${Command.DEBUG} ${value ? 1 : 0}`, msg => msg.startsWith(Command.DEBUG), timeout)
            .then(msg => msg.substring(2) === '1');
    }

    isMeasurementEnabled(timeout = this.timeout): Promise<boolean> {
        return this.sendAndWait(Command.MEASURE, msg => msg.startsWith(`${Command.MEASURE} g`), timeout)
            .then(msg => msg.substring(2) === '1');
    }

    setMeasurement(value: boolean, timeout = this.timeout): Promise<boolean> {
        return this.sendAndWait(`${Command.MEASURE} ${value ? 1 : 0}`, msg => msg.startsWith(`${Command.MEASURE} s`), timeout)
            .then(msg => msg.substring(4) === '1');
    }

    getPanels(timeout = this.timeout): Promise<Panel[]> {
        return this.sendAndWait(Command.ALL, msg => msg.startsWith(Command.ALL), timeout)
            .then(msg => {
                const [count, ...panels] = msg.substring(2).split(' ');

                return panels.map(panel => {
                    const [index, start, end, key] = panel.split(',');

                    return {
                        deadzoneStart: parseInt(start, 10),
                        deadzoneEnd: parseInt(end, 10),
                        keyCode: parseInt(key, 10),
                    }
                });
            });
    }

    getPanelCount(timeout = this.timeout): Promise<number> {
        return this.sendAndWait(Command.COUNT, msg => msg.startsWith(Command.COUNT), timeout)
            .then(msg => parseInt(msg.substring(2), 10));
    }

    getPadLayout(timeout = this.timeout): Promise<PadLayout> {
        return this.sendAndWait(Command.LAYOUT, msg => msg.startsWith(Command.LAYOUT), timeout)
            .then(msg => msg.substring(2).trim().split(' ').map(v => parseInt(v, 10)) as PadLayout);
    }

    getPanel(index: number, timeout = this.timeout): Promise<Panel> {
        const cmd = `${Command.GET} ${index}`;
        return this.sendAndWait(cmd, msg => msg.startsWith(cmd), timeout)
            .then(msg => {
            const [start, end, key] = msg.substring(cmd.length).split(' ');

            return {
                deadzoneStart: parseInt(start, 10),
                deadzoneEnd: parseInt(end, 10),
                keyCode: parseInt(key, 10),
            }
        });
    }

    writePanel(index: number, data: Panel, timeout = this.timeout): Promise<void> {
        const cmd = [
            Command.WRITE,
            index,
            data.deadzoneStart,
            data.deadzoneEnd,
            data.keyCode,
        ].join(' ');

        return this.sendAndWait(cmd, msg => msg.startsWith(`${Command.WRITE} ${index}`), timeout)
            .then(() => {});
    }

    reset(timeout = this.timeout): Promise<void> {
        return this.sendAndWait(Command.RESET, msg => msg.startsWith(Command.RESET), timeout)
            .then(() => {});
    }

    save(timeout = this.timeout): Promise<void> {
        return this.sendAndWait(Command.SAVE, msg => msg.startsWith(Command.SAVE), timeout)
            .then(() => {});
    }
}
