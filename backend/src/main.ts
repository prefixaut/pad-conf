import { createInteractiveShell, parseArguments } from './cli';
import { createWebSocketServer } from './server';

(async () => {
    const args = parseArguments();
    
    if (!args.interactive) {
        await createWebSocketServer(args);
        return;
    }

    await createInteractiveShell(args).then(() => {
        process.exit(0);
    });
})();
