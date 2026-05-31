const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    makeInMemoryStore,
    Browsers,
    delay,
    proto,
    getAggregateVotesInPollMessage
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const fs = require('fs');
const { Boom } = require('@hapi/boom');
const config = require('./config');
const { handleMessage } = require('./handlers/message-handler');
const { handleGroupEvent } = require('./handlers/event-handler');

const store = makeInMemoryStore({
    logger: pino().child({ level: 'silent', stream: 'store' })
});

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    console.log(chalk.green(`[ GODFATHER XMD ] Using WA v${version.join('.')}, isLatest: ${isLatest}`));
    
    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !config.sessionId, // QR if no session
        browser: Browsers.ubuntu('Chrome'),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        markOnlineOnConnect: config.alwaysOnline,
        defaultQueryTimeoutMs: undefined,
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg?.message || undefined;
            }
            return proto.Message.fromObject({});
        }
    });
    
    store?.bind(sock.ev);
    
    // Connection Update
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log(chalk.yellow('[ GODFATHER XMD ] Scan QR Code or use pair code'));
        }
        
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            
            switch (reason) {
                case DisconnectReason.badSession:
                    console.log(chalk.red('[ GODFATHER XMD ] Bad Session File, Delete auth folder and scan again'));
                    fs.rmSync('./auth', { recursive: true, force: true });
                    startBot();
                    break;
                case DisconnectReason.connectionClosed:
                    console.log(chalk.yellow('[ GODFATHER XMD ] Connection closed, reconnecting...'));
                    startBot();
                    break;
                case DisconnectReason.connectionLost:
                    console.log(chalk.yellow('[ GODFATHER XMD ] Connection lost, reconnecting...'));
                    startBot();
                    break;
                case DisconnectReason.connectionReplaced:
                    console.log(chalk.red('[ GODFATHER XMD ] Connection replaced, new session opened'));
                    process.exit();
                    break;
                case DisconnectReason.loggedOut:
                    console.log(chalk.red('[ GODFATHER XMD ] Device logged out, delete auth folder and scan again'));
                    fs.rmSync('./auth', { recursive: true, force: true });
                    startBot();
                    break;
                case DisconnectReason.restartRequired:
                    console.log(chalk.green('[ GODFATHER XMD ] Restart required, restarting...'));
                    startBot();
                    break;
                case DisconnectReason.timedOut:
                    console.log(chalk.yellow('[ GODFATHER XMD ] Connection timed out, reconnecting...'));
                    startBot();
                    break;
                default:
                    console.log(chalk.red(`[ GODFATHER XMD ] Unknown error: ${reason}`));
                    startBot();
            }
        }
        
        if (connection === 'open') {
            console.log(chalk.green.bold('╔══════════════════════════════════════╗'));
            console.log(chalk.green.bold('║  GODFATHER XMD CONNECTED SUCCESSFULLY ║'));
            console.log(chalk.green.bold('║  Created by: Soham                   ║'));
            console.log(chalk.green.bold('╚══════════════════════════════════════╝'));
            
            // Send startup message to owner
            const ownerJid = config.ownerNumber[0] + '@s.whatsapp.net';
            await delay(2000);
            
            const startupMsg = `╔══════════════════════╗
║  *GODFATHER XMD*  👑        ║
╠══════════════════════╣
║                              ║
║  ✅ Bot Connected!           ║
║  👤 Owner: ${config.ownerName}        ║
║  📌 Prefix: ${config.prefix}            ║
║  📡 Mode: ${config.mode}       ║
║  🤖 Version: 3.0.0          ║
║                              ║
║  Created by Soham            ║
╚══════════════════════╝`;
            
            await sock.sendMessage(ownerJid, { text: startupMsg });
        }
    });
    
    // Credentials Update
    sock.ev.on('creds.update', saveCreds);
    
    // Message Handler
    sock.ev.on('messages.upsert', async (m) => {
        if (m.type !== 'notify') return;
        const msg = m.messages[0];
        if (!msg.message) return;
        if (msg.key && msg.key.remoteJid === 'status@broadcast') return;
        
        try {
            await handleMessage(sock, msg, store);
        } catch (err) {
            console.log(chalk.red('[ ERROR ] Message Handler:', err.message));
        }
    });
    
    // Group Events
    sock.ev.on('group-participants.update', async (event) => {
        try {
            await handleGroupEvent(sock, event);
        } catch (err) {
            console.log(chalk.red('[ ERROR ] Group Event:', err.message));
        }
    });
    
    // Anti Call
    if (config.antiCall) {
        sock.ev.on('call', async (calls) => {
            for (const call of calls) {
                if (call.status === 'offer') {
                    await sock.rejectCall(call.id, call.from);
                    await sock.sendMessage(call.from, {
                        text: '❌ *Auto-reject call is enabled!*\n\n_GODFATHER XMD does not accept calls._'
                    });
                }
            }
        });
    }
    
    // Auto Read Status
    sock.ev.on('messages.upsert', async (m) => {
        if (m.type === 'notify') {
            for (const msg of m.messages) {
                if (msg.key.remoteJid === 'status@broadcast') {
                    if (config.autoRead) {
                        await sock.readMessages([msg.key]);
                    }
                }
            }
        }
    });
    
    // Poll Updates
    sock.ev.on('messages.update', async (updates) => {
        for (const update of updates) {
            if (update.update.pollUpdates) {
                const pollCreation = await store?.loadMessage(
                    update.key.remoteJid,
                    update.key.id
                );
                if (pollCreation) {
                    const votes = getAggregateVotesInPollMessage({
                        message: pollCreation.message,
                        pollUpdates: update.update.pollUpdates
                    });
                    console.log(chalk.blue('[ POLL ] Votes:', JSON.stringify(votes)));
                }
            }
        }
    });
    
    return sock;
}

module.exports = { startBot };