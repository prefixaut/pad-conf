import { FastifyInstance } from 'fastify';
import { createInterface } from 'readline';
import SerialPort from 'serialport';
import parseArgs from 'minimist';

import { BoardConnection } from './board-connection';
import { BackendArgments } from './models/options';
import { createWebSocketServer } from './server';

export function parseArguments(): BackendArgments {
    return parseArgs(process.argv.slice(2), {
        boolean: [
            'interactive',
        ],
        alias: {
            i: 'interactive',
        },
        default: {
            interactive: false,
            port: 8000,
        }
    });
}

export function createInteractiveShell(args: BackendArgments) {
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
                    console.log('Device disconnected! Exiting command mode!');
                }
                commandMode = false;
            } else if (printMessage) {
                console.log('Device disconnected!');
            }
        }

        console.log('Welcome to the pad-conf backend!');
    
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
                        board.removeMessageHandler(console.log);
                        console.log('Exited command mode!');
                        return;
                }

                board.send(line);
                return;
            }

            switch (line) {
                case 'status':
                    console.log(`Server Status: ${server != null ? 'Online' : 'Offline'}`);
                    console.log(`Selected Device: ${selectedDevice || '-none-'}`);
                    return;
                    
                case 'start':
                    if (server != null) {
                        console.log('Server is already started!');
                        return;
                    }

                    console.log('Starting server ...');
                    server = createWebSocketServer(args).app;
                    console.log('Server started!');
                    return;
    
                case 'exit':
                case 'close':
                case 'quit':
                case 'shutdown':
                    if (server != null) {
                        console.log('Shutting down server ...');
                        server.close(() => {
                            console.log('Server has shutdown.');
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
                        console.log('Available devices: ');
                        devices.forEach(dev => console.log(`\t* ${dev.path}`));
                    });
                    return;
                
                case 'disconnect':
                    if (selectedDevice == null) {
                        console.log('No device currently selected!');
                        return;
                    }

                    disconnectDevice();
                    console.log('Device disconnected!');
                    return;
                
                case 'cmd':
                case 'command':
                    if (selectedDevice == null) {
                        console.log('No device selected!');
                        return;
                    }

                    commandMode = true;
                    board.addMessageHandler(console.log);
                    console.log("You're now in command mode! Type 'exit' to exit this mode!");
                    return;
                
                case '?':
                case 'help':
                    console.log("todo: help page");
                    return;
            }

            if (line.startsWith('select')) {
                if (selectedDevice != null) {
                    console.log(`Device "${selectedDevice}" is currently selected. Disconnecting for new device ...`);
                    disconnectDevice();
                    console.log('Device disconnected!');
                }

                try {
                    const newDevice = line.substring('select'.length).trim();
                    console.log(`Creating connection to device "${newDevice}" ...`);
                    connection = new SerialPort(newDevice, { baudRate: 9600, autoOpen: true });
                    connection.on('close', () => {
                        disconnectDevice(true);
                    });
                    board = new BoardConnection(connection);
                    selectedDevice = newDevice;
                    console.log('Connection established!');
                } catch (err) {
                    disconnectDevice();
                    console.log('Error while creating connection! ', err.message)
                }
                return;
            }
        });
    });
}
