const config = require('../config');
const fs = require('fs');
const { exec } = require('child_process');
const { getDatabase, saveDatabase, banUser, unbanUser, addPremium, removePremium } = require('../lib/database');

module.exports = {
    commands: [
        'ban', 'unban', 'broadcast', 'bc', 'block', 'unblock',
        'setprefix', 'setmode', 'restart', 'shutdown', 'eval', 'exec',
        'premium', 'unpremium', 'session', 'clearsession', 'owner',
        'info', 'script', 'ping', 'speed', 'runtime'
    ],
    category: 'Owner',
    ownerOnly: false, // Some commands are public
    handler: async (ctx) => {
        const { sock, msg, from, sender, command, args, text, reply, react, isOwner, prefix, senderName } = ctx;
        
        switch (command) {
            // ====== PUBLIC COMMANDS ======
            
            case 'owner': {
                const ownerNumber = config.ownerNumber[0];
                const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${config.ownerName} - GODFATHER XMD\nTEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\nEND:VCARD`;
                
                await sock.sendMessage(from, {
                    contacts: {
                        displayName: config.ownerName,
                        contacts: [{ vcard }]
                    }
                }, { quoted: msg });
                
                await reply(`👑 *GODFATHER XMD Owner*\n\n📛 Name: ${config.ownerName}\n📞 Number: wa.me/${ownerNumber}\n\n_Created by Soham_`);
                break;
            }
            
            case 'info': {
                const os = require('os');
                const uptimeSeconds = process.uptime();
                const { runtime } = require('../lib/functions');
                
                const infoText = `╔══════════════════════╗
║   *GODFATHER XMD INFO*  ║
╠══════════════════════╣
║                          ║
║  🤖 Bot: ${config.botName}
║  👤 Owner: ${config.ownerName}
║  📌 Prefix: ${config.prefix}
║  📡 Mode: ${config.mode}
║  🔖 Version: 3.0.0
║  ⏰ Uptime: ${runtime(uptimeSeconds)}
║  💻 OS: ${os.platform()} ${os.arch()}
║  🧠 RAM: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB
║  ⚡ Node: ${process.version}
║  📦 Plugins: ${fs.readdirSync('./plugins').length}
║                          ║
║  Features:               ║
║  ✅ Anti-Link             ║
║  ✅ Anti-BadWord          ║
║  ✅ Anti-Call              ║
║  ✅ Auto-Read              ║
║  ✅ Welcome/Goodbye        ║
║  ✅ AI Chat                ║
║  ✅ Music/Video DL         ║
║  ✅ Sticker Maker          ║
║  ✅ Group Management       ║
║                          ║
║  Created by Soham 👑     ║
╚══════════════════════╝`;
                
                await reply(infoText);
                break;
            }
            
            case 'ping':
            case 'speed': {
                const start = Date.now();
                await reply('⏳ Testing speed...');
                const end = Date.now();
                const speed = end - start;
                
                await reply(`🏓 *PONG!*\n\n⚡ Response Speed: ${speed}ms\n🤖 Bot: ${config.botName}\n👑 Created by: Soham`);
                break;
            }
            
            case 'runtime': {
                const { runtime } = require('../lib/functions');
                const uptime = runtime(process.uptime());
                await reply(`⏰ *Bot Uptime*\n\n${uptime}\n\n*GODFATHER XMD by Soham*`);
                break;
            }
            
            case 'script': {
                await reply(`📜 *GODFATHER XMD Script*\n\n🔗 GitHub: https://github.com/soham/godfather-xmd\n👤 Creator: Soham\n🔖 Version: 3.0.0\n📌 Language: JavaScript/Node.js\n📦 Library: @whiskeysockets/baileys\n\n⭐ Don't forget to star the repo!\n\n_GODFATHER XMD - Created by Soham_`);
                break;
            }
            
            // ====== OWNER ONLY COMMANDS ======
            
            case 'ban': {
                if (!isOwner) return reply(config.messages.owner);
                
                const target = msg.message?.extendedTextMessage?.contextInfo?.participant || 
                              (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
                
                if (!target) return reply(`Usage: ${prefix}ban @user or reply to a message`);
                
                banUser(target);
                await react('✅');
                await reply(`✅ *User banned successfully!*\n\n👤 @${target.split('@')[0]}\n\n_GODFATHER XMD_`, {
                    mentions: [target]
                });
                break;
            }
            
            case 'unban': {
                if (!isOwner) return reply(config.messages.owner);
                
                const target2 = msg.message?.extendedTextMessage?.contextInfo?.participant || 
                               (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
                
                if (!target2) return reply(`Usage: ${prefix}unban @user`);
                
                unbanUser(target2);
                await react('✅');
                await reply(`✅ *User unbanned!*\n\n👤 @${target2.split('@')[0]}`, {
                    mentions: [target2]
                });
                break;
            }
            
            case 'broadcast':
            case 'bc': {
                if (!isOwner) return reply(config.messages.owner);
                if (!text) return reply(`Usage: ${prefix}broadcast <message>`);
                
                const groups = await sock.groupFetchAllParticipating();
                const groupIds = Object.keys(groups);
                
                let success = 0;
                let failed = 0;
                
                await reply(`📢 Broadcasting to ${groupIds.length} groups...`);
                
                for (const groupId of groupIds) {
                    try {
                        await sock.sendMessage(groupId, {
                            text: `📢 *BROADCAST*\n\n${text}\n\n*- ${config.botName}*\n*By: ${config.ownerName}*`
                        });
                        success++;
                    } catch {
                        failed++;
                    }
                }
                
                await reply(`📢 *Broadcast Complete!*\n\n✅ Success: ${success}\n❌ Failed: ${failed}\nTotal: ${groupIds.length}`);
                break;
            }
            
            case 'block': {
                if (!isOwner) return reply(config.messages.owner);
                
                const blockTarget = msg.message?.extendedTextMessage?.contextInfo?.participant || 
                                   (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
                
                if (!blockTarget) return reply(`Usage: ${prefix}block @user`);
                
                await sock.updateBlockStatus(blockTarget, 'block');
                await reply(`🚫 *Blocked!* @${blockTarget.split('@')[0]}`, {
                    mentions: [blockTarget]
                });
                break;
            }
            
            case 'unblock': {
                if (!isOwner) return reply(config.messages.owner);
                
                const unblockTarget = msg.message?.extendedTextMessage?.contextInfo?.participant || 
                                     (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
                
                if (!unblockTarget) return reply(`Usage: ${prefix}unblock @user`);
                
                await sock.updateBlockStatus(unblockTarget, 'unblock');
                await reply(`✅ *Unblocked!* @${unblockTarget.split('@')[0]}`, {
                    mentions: [unblockTarget]
                });
                break;
            }
            
            case 'setprefix': {
                if (!isOwner) return reply(config.messages.owner);
                if (!args[0]) return reply(`Usage: ${prefix}setprefix <new prefix>`);
                
                config.prefix = args[0];
                await reply(`✅ *Prefix changed to:* ${args[0]}\n\n_GODFATHER XMD_`);
                break;
            }
            
            case 'setmode': {
                if (!isOwner) return reply(config.messages.owner);
                if (!args[0] || !['public', 'private', 'group'].includes(args[0])) {
                    return reply(`Usage: ${prefix}setmode <public/private/group>`);
                }
                
                config.mode = args[0];
                await reply(`✅ *Mode changed to:* ${args[0]}\n\n_GODFATHER XMD_`);
                break;
            }
            
            case 'restart': {
                if (!isOwner) return reply(config.messages.owner);
                await reply('🔄 *Restarting GODFATHER XMD...*');
                process.exit(0);
                break;
            }
            
            case 'shutdown': {
                if (!isOwner) return reply(config.messages.owner);
                await reply('⛔ *Shutting down GODFATHER XMD...*\n\n_Goodbye! - by Soham_');
                process.exit(1);
                break;
            }
            
            case 'eval': {
                if (!isOwner) return reply(config.messages.owner);
                if (!text) return reply(`Usage: ${prefix}eval <code>`);
                
                try {
                    let result = eval(text);
                    if (typeof result === 'object') {
                        result = JSON.stringify(result, null, 2);
                    }
                    await reply(`✅ *Result:*\n\n${result}`);
                } catch (err) {
                    await reply(`❌ *Error:*\n\n${err.message}`);
                }
                break;
            }
            
            case 'exec': {
                if (!isOwner) return reply(config.messages.owner);
                if (!text) return reply(`Usage: ${prefix}exec <command>`);
                
                exec(text, (err, stdout, stderr) => {
                    if (err) return reply(`❌ *Error:*\n${err.message}`);
                    if (stderr) return reply(`⚠️ *Stderr:*\n${stderr}`);
                    reply(`✅ *Output:*\n\n${stdout}`);
                });
                break;
            }
            
            case 'premium': {
                if (!isOwner) return reply(config.messages.owner);
                
                const premTarget = msg.message?.extendedTextMessage?.contextInfo?.participant || 
                                  (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
                
                if (!premTarget) return reply(`Usage: ${prefix}premium @user`);
                
                addPremium(premTarget);
                await reply(`⭐ *Premium activated for* @${premTarget.split('@')[0]}`, {
                    mentions: [premTarget]
                });
                break;
            }
            
            case 'unpremium': {
                if (!isOwner) return reply(config.messages.owner);
                
                const unpremTarget = msg.message?.extendedTextMessage?.contextInfo?.participant || 
                                    (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
                
                if (!unpremTarget) return reply(`Usage: ${prefix}unpremium @user`);
                
                removePremium(unpremTarget);
                await reply(`❌ *Premium removed for* @${unpremTarget.split('@')[0]}`, {
                    mentions: [unpremTarget]
                });
                break;
            }
            
            case 'session': {
                if (!isOwner) return reply(config.messages.owner);
                
                if (fs.existsSync('./auth/creds.json')) {
                    const creds = fs.readFileSync('./auth/creds.json', 'utf-8');
                    const encoded = Buffer.from(creds).toString('base64');
                    
                    await sock.sendMessage(from, {
                        document: Buffer.from(encoded),
                        fileName: `GODFATHER_XMD_SESSION_${Date.now()}.txt`,
                        mimetype: 'text/plain',
                        caption: `🔑 *GODFATHER XMD Session*\n\n_Keep this safe! Don't share with anyone._\n\n*By: Soham*`
                    }, { quoted: msg });
                } else {
                    await reply('❌ No session found!');
                }
                break;
            }
            
            case 'clearsession': {
                if (!isOwner) return reply(config.messages.owner);
                
                const authFiles = fs.readdirSync('./auth').filter(f => f !== 'creds.json');
                let cleared = 0;
                
                for (const file of authFiles) {
                    try {
                        fs.unlinkSync(`./auth/${file}`);
                        cleared++;
                    } catch {}
                }
                
                await reply(`🧹 *Session cleaned!*\n\nCleared ${cleared} session files.\n\n_GODFATHER XMD_`);
                break;
            }
        }
    }
};