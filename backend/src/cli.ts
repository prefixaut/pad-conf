import { FastifyInstance } from 'fastify';
import parseArgs from 'minimist';
import { Logger } from 'pino';
import { createInterface } from 'readline';
import SerialPort from 'serialport';

import { BoardConnection } from './board-connection';
import { BackendArgments } from './models/options';
import { createWebSocketServer } from './server';

export function parseArguments(): BackendArgments {
    return parseArgs(process.argv.slice(2), {
        boolean: [
            'interactive',
            'help',
            'version',
            'trace',
            'log-out',
        ],
        strings: [
            'log-out',
            'level',
        ],
        alias: {
            'h': 'help',
            '?': 'help',
            'v': 'version',
            't': 'trace',
            'o': 'log-out',
            'l': 'level',
            'i': 'interactive',
        },
        default: {
            help: false,
            version: false,
            trace: false,
            interactive: false,
            'log-out': null,
            'level': 'info',
            port: 8000,
        }
    });
}

export function createInteractiveShell(args: BackendArgments, logger: Logger) {
    return new Promise<void>(resolve => {
        let selectedDevice: string;
        let connection: SerialPort;
        let board: BoardConnection;
        let commandMode: boolean = false;
        let server: FastifyInstance;
    
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false,
        });

        function disconnectDevice(printMessage = false) {
            try {
                board.close();
                if (connection.isOpen) {
                    connection.close();
                }
                selectedDevice = null;
            } catch {}
            if (commandMode) {
                if (printMessage) {
                    logger.info('Device disconnected! Exiting command mode!');
                }
                commandMode = false;
            } else if (printMessage) {
                logger.info('Device disconnected!');
            }
        }

        logger.info('Welcome to the pad-conf backend!');
    
        rl.on('line', line => {
            line = line.trim();
            if (line.length === 0) {
                return;
            }

            if (commandMode) {
                switch (line) {
                    case 'exit':
                    case 'stop':
                    case 'quit':
                        commandMode = false;
                        board.removeMessageHandler(logger.info);
                        logger.info('Exited command mode!');
                        return;
                }

                board.send(line);
                return;
            }

            switch (line) {
                case 'status':
                    logger.info(`Server Status: ${server != null ? 'Online' : 'Offline'}`);
                    logger.info(`Selected Device: ${selectedDevice || '-none-'}`);
                    return;
                    
                case 'start':
                    if (server != null) {
                        logger.info('Server is already started!');
                        return;
                    }

                    logger.info('Starting server ...');
                    server = createWebSocketServer(args, logger).app;
                    logger.info('Server started!');
                    return;
    
                case 'exit':
                case 'close':
                case 'quit':
                case 'shutdown':
                    if (server != null) {
                        logger.info('Shutting down server ...');
                        server.close(() => {
                            logger.info('Server has shutdown.');
                            server = null;
                            resolve();
                        });
                        return;
                    }
                    resolve();
                    return;

                case 'list':
                case 'ls':
                    SerialPort.list().then(devices => {
                        logger.info('Available devices: ');
                        devices.forEach(device => {
                            let name = [
                                device.manufacturer,
                                device.pnpId,
                            ]
                                .filter(str => typeof str === 'string' && !str.startsWith('('))
                                .join(' ')
                                .trim();
                        
                            if (name != '') {
                                name = `${device.path}: ${name}`.trim();
                            } else {
                                name = device.path;
                            }

                            logger.info(`    * ${name}`);
                        });
                        logger.info('');
                    });
                    return;
                
                case 'disconnect':
                    if (selectedDevice == null) {
                        logger.info('No device currently selected!');
                        return;
                    }

                    disconnectDevice();
                    logger.info('Device disconnected!');
                    return;
                
                case 'cmd':
                case 'command':
                    if (selectedDevice == null) {
                        logger.info('No device selected!');
                        return;
                    }

                    commandMode = true;
                    board.addMessageHandler(logger.info);
                    logger.info("You're now in command mode! Type 'exit' to exit this mode!");
                    return;
                
                case '?':
                case 'help':
                    logger.info(
`You're in the regular management mode. Available commands:

    * status            Check the status of the server and the selected device.
    * start             Start the server to connect via the UI to calibrate your Pad.
    * exit, close       Stop the server and close this application.
      quit, shutdown
    * list, ls          List all available devices.
    * select <device>   Select and connect to the specified device.
    * disconnect        Disconnect from the currently selected device.
    * cmd, command      Enter command mode to send commands manually to your Pad.
`);
                    return;
            }

            if (line.startsWith('select')) {
                if (selectedDevice != null) {
                    logger.info(`Device "${selectedDevice}" is currently selected. Disconnecting for new device ...`);
                    disconnectDevice();
                    logger.info('Device disconnected!');
                }

                try {
                    const newDevice = line.substring('select'.length).trim();
                    logger.info(`Creating connection to device "${newDevice}" ...`);
                    connection = new SerialPort(newDevice, { baudRate: 9600, autoOpen: true });
                    connection.on('close', () => {
                        disconnectDevice(true);
                    });
                    board = new BoardConnection(connection);
                    selectedDevice = newDevice;
                    logger.info('Connection established!');
                } catch (err) {
                    disconnectDevice();
                    logger.info('Error while creating connection! ', err.message)
                }
                return;
            }
        });
    });
}
