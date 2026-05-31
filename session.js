const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
    delay
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const readline = require('readline');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(text) {
    return new Promise((resolve) => rl.question(text, resolve));
}

console.log(chalk.cyan.bold(`
╔══════════════════════════════════════════╗
║   GODFATHER XMD - SESSION ID GENERATOR  ║
║          Created by Soham                ║
╚══════════════════════════════════════════╝
`));

// Generate unique session ID
function generateSessionId() {
    const timestamp = Date.now().toString(36);
    const randomPart = crypto.randomBytes(16).toString('hex');
    return `GODFATHER_${timestamp}_${randomPart}`;
}

// Encode session to Base64
function encodeSession(authFolder) {
    try {
        const credsPath = path.join(authFolder, 'creds.json');
        if (!fs.existsSync(credsPath)) {
            throw new Error('creds.json not found');
        }
        
        const creds = fs.readFileSync(credsPath, 'utf-8');
        const sessionData = {
            botName: 'GODFATHER XMD',
            author: 'Soham',
            version: '3.0.0',
            sessionId: generateSessionId(),
            timestamp: new Date().toISOString(),
            creds: JSON.parse(creds)
        };
        
        const encoded = Buffer.from(JSON.stringify(sessionData)).toString('base64');
        return {
            sessionId: sessionData.sessionId,
            encoded: encoded
        };
    } catch (err) {
        throw new Error('Failed to encode session: ' + err.message);
    }
}

// Decode session from Base64
function decodeSession(encodedSession) {
    try {
        const decoded = Buffer.from(encodedSession, 'base64').toString('utf-8');
        return JSON.parse(decoded);
    } catch (err) {
        throw new Error('Failed to decode session: ' + err.message);
    }
}

// Restore session from encoded data
function restoreSession(encodedSession, authFolder) {
    try {
        const sessionData = decodeSession(encodedSession);
        
        if (!fs.existsSync(authFolder)) {
            fs.mkdirSync(authFolder, { recursive: true });
        }
        
        const credsPath = path.join(authFolder, 'creds.json');
        fs.writeFileSync(credsPath, JSON.stringify(sessionData.creds, null, 2));
        
        return {
            success: true,
            sessionId: sessionData.sessionId,
            botName: sessionData.botName,
            author: sessionData.author
        };
    } catch (err) {
        throw new Error('Failed to restore session: ' + err.message);
    }
}

async function main() {
    console.log(chalk.yellow(`
Select an option:
1. Generate new Session ID (with Pair Code)
2. Generate new Session ID (with QR Code)
3. Restore Session from Session ID
4. Export current Session
5. Exit
`));
    
    const choice = await question(chalk.green('Enter your choice (1-5): '));
    
    switch (choice.trim()) {
        case '1':
            await generateWithPairCode();
            break;
        case '2':
            await generateWithQR();
            break;
        case '3':
            await restoreFromSession();
            break;
        case '4':
            await exportSession();
            break;
        case '5':
            console.log(chalk.green('Goodbye! - GODFATHER XMD by Soham'));
            process.exit(0);
            break;
        default:
            console.log(chalk.red('Invalid choice!'));
            process.exit(1);
    }
}

async function generateWithPairCode() {
    const phoneNumber = await question(chalk.yellow('Enter phone number (with country code): '));
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    if (cleanNumber.length < 10) {
        console.log(chalk.red('Invalid phone number!'));
        process.exit(1);
    }
    
    const sessionFolder = './auth_session_' + Date.now();
    fs.mkdirSync(sessionFolder, { recursive: true });
    
    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
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
    
    if (!sock.authState.creds.registered) {
        await delay(2000);
        try {
            const code = await sock.requestPairingCode(cleanNumber);
            console.log(chalk.green.bold(`\n🔑 Your Pair Code: ${chalk.white.bold(code)}`));
            console.log(chalk.yellow('Enter this code in WhatsApp > Linked Devices > Link with phone number'));
        } catch (err) {
            console.log(chalk.red('Failed to generate pair code:', err.message));
            fs.rmSync(sessionFolder, { recursive: true, force: true });
            process.exit(1);
        }
    }
    
    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        
        if (connection === 'open') {
            console.log(chalk.green('\n✅ Connected successfully!'));
            
            await delay(3000);
            await saveCreds();
            
            // Generate Session ID
            const { sessionId, encoded } = encodeSession(sessionFolder);
            
            // Save session file
            const sessionFile = `session_${sessionId}.txt`;
            fs.writeFileSync(sessionFile, encoded);
            
            console.log(chalk.cyan.bold(`
╔══════════════════════════════════════════════════╗
║        GODFATHER XMD - SESSION GENERATED!        ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  Session ID: ${sessionId.substring(0, 30)}...    ║
║                                                  ║
║  Session saved to: ${sessionFile}                ║
║                                                  ║
║  To use this session:                            ║
║  1. Copy the session file content                ║
║  2. Use option 3 to restore                      ║
║  3. Or set SESSION_ID in config.js               ║
║                                                  ║
║  Created by: Soham                               ║
╚══════════════════════════════════════════════════╝
`));
            
            console.log(chalk.yellow.bold('\n📋 SESSION ID (copy this):'));
            console.log(chalk.white(encoded.substring(0, 100) + '...'));
            console.log(chalk.green(`\n📁 Full session saved to: ${sessionFile}`));
            
            // Also copy to main auth folder
            if (!fs.existsSync('./auth')) {
                fs.mkdirSync('./auth', { recursive: true });
            }
            fs.copyFileSync(
                path.join(sessionFolder, 'creds.json'),
                path.join('./auth', 'creds.json')
            );
            
            // Cleanup temp session folder
            fs.rmSync(sessionFolder, { recursive: true, force: true });
            
            await delay(2000);
            rl.close();
            process.exit(0);
        }
        
        if (connection === 'close') {
            console.log(chalk.red('Connection failed!'));
            fs.rmSync(sessionFolder, { recursive: true, force: true });
            process.exit(1);
        }
    });
}

async function generateWithQR() {
    const sessionFolder = './auth_session_' + Date.now();
    fs.mkdirSync(sessionFolder, { recursive: true });
    
    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        browser: Browsers.ubuntu('Chrome'),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    console.log(chalk.yellow('\n📱 Scan the QR code with WhatsApp'));
    
    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        
        if (connection === 'open') {
            console.log(chalk.green('\n✅ Connected successfully!'));
            
            await delay(3000);
            await saveCreds();
            
            const { sessionId, encoded } = encodeSession(sessionFolder);
            const sessionFile = `session_${sessionId}.txt`;
            fs.writeFileSync(sessionFile, encoded);
            
            console.log(chalk.green.bold(`\n✅ Session ID Generated!`));
            console.log(chalk.yellow(`📁 Session saved to: ${sessionFile}`));
            
            if (!fs.existsSync('./auth')) {
                fs.mkdirSync('./auth', { recursive: true });
            }
            fs.copyFileSync(
                path.join(sessionFolder, 'creds.json'),
                path.join('./auth', 'creds.json')
            );
            
            fs.rmSync(sessionFolder, { recursive: true, force: true });
            
            rl.close();
            process.exit(0);
        }
    });
}

async function restoreFromSession() {
    console.log(chalk.yellow('\nEnter session ID in one of these ways:'));
    console.log('1. Paste the base64 encoded session string');
    console.log('2. Enter the path to session file\n');
    
    const input = await question(chalk.green('Enter session data or file path: '));
    
    let sessionData;
    
    if (fs.existsSync(input.trim())) {
        sessionData = fs.readFileSync(input.trim(), 'utf-8').trim();
    } else {
        sessionData = input.trim();
    }
    
    try {
        const result = restoreSession(sessionData, './auth');
        
        console.log(chalk.green.bold(`
╔══════════════════════════════════════╗
║   SESSION RESTORED SUCCESSFULLY!     ║
╠══════════════════════════════════════╣
║  Bot: ${result.botName}                   ║
║  Author: ${result.author}                  ║
║  Session: ${result.sessionId.substring(0, 20)}... ║
╚══════════════════════════════════════╝
`));
        console.log(chalk.yellow('Now run: npm start'));
    } catch (err) {
        console.log(chalk.red('Failed to restore session:', err.message));
    }
    
    rl.close();
    process.exit(0);
}

async function exportSession() {
    if (!fs.existsSync('./auth/creds.json')) {
        console.log(chalk.red('No existing session found! Connect first.'));
        process.exit(1);
    }
    
    try {
        const { sessionId, encoded } = encodeSession('./auth');
        const sessionFile = `exported_session_${Date.now()}.txt`;
        fs.writeFileSync(sessionFile, encoded);
        
        console.log(chalk.green.bold(`\n✅ Session exported!`));
        console.log(chalk.yellow(`📁 File: ${sessionFile}`));
        console.log(chalk.yellow(`🔑 Session ID: ${sessionId}`));
    } catch (err) {
        console.log(chalk.red('Failed to export:', err.message));
    }
    
    rl.close();
    process.exit(0);
}

main().catch(err => {
    console.log(chalk.red('Error:', err.message));
    process.exit(1);
});