import pino from 'pino';

import { createInteractiveShell, parseArguments } from './cli';
import { BackendArgments } from './models/options';
import { createWebSocketServer } from './server';
import { version } from '../../package.json';

function createLogger(args: BackendArgments) {
    const targets: any[] = [
        { target: 'pino-pretty', level: (args.level as any) },
    ];

    if (args['log-out']) {
        targets.push({
            level: 'trace',
            target: 'pino/file',
            options: { destination: args['log-out'] },
        });
    }

    const logger = pino({
        name: 'pad-conf',
        level: args.level,
        transport: {
            targets,
        }
    });

    return logger;
}

(async () => {
    const args = parseArguments();

    if (args.trace) {
        args.level = 'trace';
    }

    const logger = createLogger(args);

    if (args.version) {
        console.log(`pad-conf ${version}`);
        return;
    }

    if (args.help) {
        console.log(
`Usage: pad-conf [options]

Options:

    * -h, -?, --help        Print this help page and exit.
    * -v, --version         Print the version and exit.
    * -t, --trace           Set the "level" to "trace".
    * -i, --interactive     Start the backend in the interactive mode.
    * -o, --log-out <path>  The path to where to save the log file to.
    * -l, --level <level>   The level of the logging.
                            Must be one of "fatal", "error", "warn", "info", "debug" or "trace".
`);
        return;
    }
    
    if (!args.interactive) {
        await createWebSocketServer(args, logger);
        return;
    }

    await createInteractiveShell(args, logger).then(() => {
        process.exit(0);
    });
})();
