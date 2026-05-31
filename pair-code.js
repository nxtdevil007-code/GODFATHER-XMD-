const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
    delay
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(text) {
    return new Promise((resolve) => rl.question(text, resolve));
}

console.log(chalk.cyan.bold(`
╔══════════════════════════════════════╗
║     GODFATHER XMD - PAIR CODE       ║
║     Generator by Soham              ║
╚══════════════════════════════════════╝
`));

async function generatePairCode() {
    const phoneNumber = await question(chalk.yellow('Enter your phone number (with country code, e.g., 919876543210): '));
    
    if (!phoneNumber || phoneNumber.length < 10) {
        console.log(chalk.red('Invalid phone number!'));
        process.exit(1);
    }
    
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    console.log(chalk.green(`\n[ GODFATHER XMD ] Generating pair code for: ${cleanNumber}`));
    
    // Clean auth folder for fresh pairing
    if (fs.existsSync('./auth')) {
        fs.rmSync('./auth', { recursive: true, force: true });
    }
    fs.mkdirSync('./auth', { recursive: true });
    
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.ubuntu('Chrome'),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    // Request pair code
    if (!sock.authState.creds.registered) {
        await delay(2000);
        
        try {
            const code = await sock.requestPairingCode(cleanNumber);
            
            console.log(chalk.green.bold(`
╔══════════════════════════════════════╗
║     GODFATHER XMD - PAIR CODE       ║
╠══════════════════════════════════════╣
║                                      ║
║   Your Pair Code: ${chalk.white.bold(code)}          ║
║                                      ║
║   Steps:                             ║
║   1. Open WhatsApp on your phone     ║
║   2. Go to Linked Devices            ║
║   3. Tap "Link a Device"             ║
║   4. Tap "Link with phone number"    ║
║   5. Enter this pair code            ║
║                                      ║
║   Code expires in 60 seconds!        ║
║   Created by: Soham                  ║
║                                      ║
╚══════════════════════════════════════╝
`));
        } catch (err) {
            console.log(chalk.red('[ ERROR ] Failed to generate pair code:', err.message));
            console.log(chalk.yellow('[ TIP ] Make sure the phone number is correct and WhatsApp is installed'));
            process.exit(1);
        }
    }
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'open') {
            console.log(chalk.green.bold('\n✅ Successfully paired!'));
            console.log(chalk.green('[ GODFATHER XMD ] Your session has been saved in ./auth folder'));
            console.log(chalk.yellow('\nNow run: npm start'));
            
            await delay(3000);
            rl.close();
            process.exit(0);
        }
        
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason === DisconnectReason.connectionClosed) {
                console.log(chalk.yellow('[ INFO ] Connection closed'));
            } else if (reason === DisconnectReason.timedOut) {
                console.log(chalk.red('[ ERROR ] Pair code expired! Run again.'));
            }
            process.exit(1);
        }
    });
}

generatePairCode().catch(err => {
    console.log(chalk.red('Error:', err.message));
    process.exit(1);
});