const config = require('../config');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { getDatabase, saveDatabase } = require('../lib/database');
const { parseMessage, isOwner, isAdmin, isBotAdmin } = require('../lib/functions');

// Load all plugins
const plugins = {};
const pluginDir = path.join(__dirname, '..', 'plugins');

if (fs.existsSync(pluginDir)) {
    const pluginFiles = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'));
    for (const file of pluginFiles) {
        try {
            const plugin = require(path.join(pluginDir, file));
            if (plugin.commands) {
                for (const cmd of plugin.commands) {
                    plugins[cmd] = plugin;
                }
            }
            console.log(chalk.green(`[ PLUGIN ] Loaded: ${file}`));
        } catch (err) {
            console.log(chalk.red(`[ PLUGIN ] Failed to load ${file}: ${err.message}`));
        }
    }
}

async function handleMessage(sock, msg, store) {
    try {
        const parsed = parseMessage(msg);
        if (!parsed) return;
        
        const {
            from, sender, senderName, body, isGroup, isOwnerMsg,
            type, pushName, quoted, mentionedJid, isMedia
        } = parsed;
        
        // Get command and args
        const prefix = config.prefix;
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
        const args = isCmd ? body.slice(prefix.length + command.length).trim().split(' ') : [];
        const text = args.join(' ');
        
        // Logging
        if (isCmd) {
            console.log(chalk.cyan(`[ CMD ] ${command} from ${pushName || sender} in ${isGroup ? from : 'DM'}`));
        }
        
        // Auto Read
        if (config.autoRead) {
            await sock.readMessages([msg.key]);
        }
        
        // Auto Typing
        if (config.autoTyping && isCmd) {
            await sock.sendPresenceUpdate('composing', from);
        }
        
        // Mode check
        if (config.mode === 'private' && !isOwnerMsg) return;
        if (config.mode === 'group' && !isGroup) return;
        
        // Anti-Link (Group)
        if (isGroup && config.antiLink && !isOwnerMsg) {
            const linkRegex = /(https?:\/\/|www\.)[^\s]+/gi;
            if (linkRegex.test(body)) {
                const groupMetadata = await sock.groupMetadata(from);
                const botIsAdmin = groupMetadata.participants
                    .find(p => p.id === sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net')?.admin;
                const senderIsAdmin = groupMetadata.participants
                    .find(p => p.id === sender)?.admin;
                
                if (botIsAdmin && !senderIsAdmin) {
                    await sock.sendMessage(from, {
                        text: '⚠️ *Anti-Link Detected!*\n_Links are not allowed in this group._\n\n*- GODFATHER XMD*'
                    });
                    await sock.groupParticipantsUpdate(from, [sender], 'remove');
                    return;
                }
            }
        }
        
        // Anti Bad Word
        if (isGroup && config.antiBadWord && !isOwnerMsg) {
            const badWords = ['fuck', 'shit', 'bitch', 'ass', 'dick']; // Add more
            const hasBadWord = badWords.some(word => body.toLowerCase().includes(word));
            if (hasBadWord) {
                await sock.sendMessage(from, {
                    text: '⚠️ *Bad language detected!*\n_Please maintain decency._\n\n*- GODFATHER XMD*',
                    mentions: [sender]
                });
                return;
            }
        }
        
        // Track user in database
        const db = getDatabase();
        if (!db.users[sender]) {
            db.users[sender] = {
                name: pushName || 'Unknown',
                commandCount: 0,
                joinedAt: new Date().toISOString(),
                banned: false,
                premium: false
            };
        }
        
        if (isCmd) {
            db.users[sender].commandCount = (db.users[sender].commandCount || 0) + 1;
            saveDatabase(db);
        }
        
        // Check if user is banned
        if (db.banned && db.banned.includes(sender) && !isOwnerMsg) {
            await sock.sendMessage(from, {
                text: '❌ *You are banned from using this bot!*\n_Contact the owner to get unbanned._'
            });
            return;
        }
        
        if (!isCmd) return;
        
        // Create message context
        const ctx = {
            sock,
            msg,
            from,
            sender,
            senderName: pushName || senderName,
            body,
            command,
            args,
            text,
            prefix,
            isGroup,
            isOwner: isOwnerMsg,
            quoted,
            mentionedJid,
            isMedia,
            type,
            store,
            reply: async (text) => {
                return sock.sendMessage(from, { text }, { quoted: msg });
            },
            react: async (emoji) => {
                return sock.sendMessage(from, {
                    react: { text: emoji, key: msg.key }
                });
            },
            sendImage: async (buffer, caption = '') => {
                return sock.sendMessage(from, {
                    image: buffer,
                    caption
                }, { quoted: msg });
            },
            sendVideo: async (buffer, caption = '') => {
                return sock.sendMessage(from, {
                    video: buffer,
                    caption
                }, { quoted: msg });
            },
            sendAudio: async (buffer, ptt = false) => {
                return sock.sendMessage(from, {
                    audio: buffer,
                    mimetype: 'audio/mpeg',
                    ptt
                }, { quoted: msg });
            },
            sendDocument: async (buffer, filename, mimetype) => {
                return sock.sendMessage(from, {
                    document: buffer,
                    fileName: filename,
                    mimetype
                }, { quoted: msg });
            },
            sendSticker: async (buffer) => {
                return sock.sendMessage(from, {
                    sticker: buffer
                }, { quoted: msg });
            },
            getGroupMetadata: async () => {
                if (!isGroup) return null;
                return sock.groupMetadata(from);
            },
            isAdmin: async () => {
                if (!isGroup) return false;
                return isAdmin(sock, from, sender);
            },
            isBotAdmin: async () => {
                if (!isGroup) return false;
                return isBotAdmin(sock, from);
            }
        };
        
        // Auto React to commands
        if (config.autoReact) {
            await ctx.react('⚡');
        }
        
        // Execute plugin command
        if (plugins[command]) {
            const plugin = plugins[command];
            
            // Check permissions
            if (plugin.ownerOnly && !isOwnerMsg) {
                return ctx.reply(config.messages.owner);
            }
            if (plugin.groupOnly && !isGroup) {
                return ctx.reply(config.messages.group);
            }
            if (plugin.privateOnly && isGroup) {
                return ctx.reply(config.messages.private);
            }
            if (plugin.adminOnly) {
                const adminStatus = await ctx.isAdmin();
                if (!adminStatus && !isOwnerMsg) {
                    return ctx.reply(config.messages.admin);
                }
            }
            if (plugin.botAdminRequired) {
                const botAdminStatus = await ctx.isBotAdmin();
                if (!botAdminStatus) {
                    return ctx.reply(config.messages.botAdmin);
                }
            }
            
            try {
                await plugin.handler(ctx);
            } catch (err) {
                console.log(chalk.red(`[ ERROR ] Plugin ${command}:`, err.message));
                await ctx.reply(`${config.messages.error}\n\n_Error: ${err.message}_`);
            }
        } else {
            // Command not found
            // Uncomment below if you want to show "command not found" message
            // await ctx.reply(`❌ Command *${command}* not found!\n\nType *${prefix}menu* to see available commands.`);
        }
        
    } catch (err) {
        console.log(chalk.red('[ ERROR ] handleMessage:', err.message));
    }
}

module.exports = { handleMessage };