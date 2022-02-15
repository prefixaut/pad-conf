import { Level } from 'pino';

export interface BackendArgments {
    help: boolean;
    version: boolean;
    trace: boolean;
    interactive: boolean;
    port: number;
    'log-out': string;
    level: Level;
}

export interface ServerOptions {
    port: number;
}

