import SerialPort from 'serialport';

import { Command, PadLayout, Panel } from '../common';

type ResponseFilter = (msg: string) => boolean;

export class BoardConnection {
    
    constructor(
        private connection: SerialPort,
        private timeout: number = 5_000,
    ) {}

    private sendAndWait(command: string, filter: ResponseFilter, timeout: number = this.timeout): Promise<string> {
        return new Promise((resolve, reject) => {
            let timer = null;
            let resolved = false;

            const handler = (event: any) => {
                const msg = event.toString();
                if (!filter(msg)) {
                    return;
                }
                resolved = true;
                if (timer != null) {
                    clearTimeout(timer);
                }
                this.connection.off('data', handler);
                resolve(msg);
            };

            this.connection.on('data', handler);
            this.send(command);

            if (!resolved) {
                timer = setTimeout(() => {
                    this.connection.off('data', handler);
                    const msg = `Command "${command}" reched a timeout!`;
                    console.error(msg);
                    reject(msg);
                }, timeout);
            }
        });
    }

    private send(command: string) {
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

    isMeassurementEnabled(timeout = this.timeout): Promise<boolean> {
        return this.sendAndWait(Command.MEASSURE, msg => msg.startsWith(Command.MEASSURE), timeout)
            .then(msg => msg.substring(2) === '1');
    }

    setMeassurement(value: boolean, timeout = this.timeout): Promise<boolean> {
        return this.sendAndWait(`${Command.MEASSURE} ${value ? 1 : 0}`, msg => msg.startsWith(Command.MEASSURE), timeout)
            .then(msg => msg.substring(2) === '1');
    }

    getPanels(timeout = this.timeout): Promise<Panel[]> {
        return this.sendAndWait(Command.ALL, msg => msg.startsWith(Command.ALL), timeout)
            .then(msg => {
                const [count, ...panels] = msg.substring(2).split(' ');

                return panels.map(panel => {
                    const [index, parts] = panel.split(':');
                    const [pin, base, pos, neg, key] = parts.split(',');

                    return {
                        pin: parseInt(pin, 10),
                        baseValue: parseInt(base, 10),
                        positiveThreshold: parseInt(pos, 10),
                        negativeThreshold: parseInt(neg, 10),
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
            .then(msg => msg.substring(2).split('').map(v => v === '1') as PadLayout);
    }

    getPanel(index: number, timeout = this.timeout): Promise<Panel> {
        const cmd = `${Command.GET} ${index}`;
        return this.sendAndWait(cmd, msg => msg.startsWith(cmd), timeout)
            .then(msg => {
            const [pin, base, pos, neg, key] = msg.substring(cmd.length).split(' ');

            return {
                pin: parseInt(pin, 10),
                baseValue: parseInt(base, 10),
                positiveThreshold: parseInt(pos, 10),
                negativeThreshold: parseInt(neg, 10),
                keyCode: parseInt(key, 10),
            }
        });
    }

    writePanel(index: number, data: Panel, timeout = this.timeout): Promise<void> {
        const cmd = [
            Command.WRITE,
            index,
            data.pin,
            data.baseValue,
            data.positiveThreshold,
            data.negativeThreshold,
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
