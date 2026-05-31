const config = require('../config');

module.exports = {
    commands: [
        'kick', 'remove', 'add', 'promote', 'demote', 'mute', 'unmute',
        'tagall', 'hidetag', 'groupinfo', 'setname', 'setdesc', 'setppgc',
        'link', 'revoke', 'antilink', 'warn', 'resetwarn', 'leave',
        'group', 'everyone'
    ],
    category: 'Group',
    groupOnly: true,
    handler: async (ctx) => {
        const { sock, msg, from, sender, command, args, text, reply, react, isOwner, prefix } = ctx;
        
        const groupMetadata = await ctx.getGroupMetadata();
        if (!groupMetadata) return reply(config.messages.group);
        
        const participants = groupMetadata.participants;
        const groupAdmins = participants.filter(p => p.admin).map(p => p.id);
        const botId = sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net';
        const isBotAdmin = groupAdmins.includes(botId);
        const isSenderAdmin = groupAdmins.includes(sender) || isOwner;
        
        switch (command) {
            case 'kick':
            case 'remove': {
                if (!isSenderAdmin) return reply(config.messages.admin);
                if (!isBotAdmin) return reply(config.messages.botAdmin);
                
                const target = msg.message?.extendedTextMessage?.contextInfo?.participant ||
                              (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
                
                if (!target) return reply(`Usage: ${prefix}kick @user or reply to a message`);
                
                await sock.groupParticipantsUpdate(from, [target], 'remove');
                await reply(`✅ *Kicked!* @${target.split('@')[0]}\n\n_GODFATHER XMD_`, {
                    mentions: [target]
                });
                break;
            }
            
            case 'add': {
                if (!isSenderAdmin) return reply(config.messages.admin);
                if (!isBotAdmin) return reply(config.messages.botAdmin);
                
                if (!args[0]) return reply(`Usage: ${prefix}add <number>`);
                
                const addTarget = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                
                try {
                    await sock.groupParticipantsUpdate(from, [addTarget], 'add');
                    await reply(`✅ *Added!* @${addTarget.split('@')[0]}`, {
                        mentions: [addTarget]
                    });
                } catch (err) {
                    await reply(`❌ Failed to add user. They may have privacy settings enabled.\n\nSending invite link instead...`);
                    const inviteCode = await sock.groupInviteCode(from);
                    await sock.sendMessage(addTarget, {
                        text: `You have been invited to join *${groupMetadata.subject}*\n\nhttps://chat.whatsapp.com/${inviteCode}\n\n_Sent via GODFATHER XMD_`
                    });
                }
                break;
            }
            
            case 'promote': {
                if (!isSenderAdmin) return reply(config.messages.admin);
                if (!isBotAdmin) return reply(config.messages.botAdmin);
                
                const promoteTarget = msg.message?.extendedTextMessage?.contextInfo?.participant ||
                                     (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
                
                if (!promoteTarget) return reply(`Usage: ${prefix}promote @user`);
                
                await sock.groupParticipantsUpdate(from, [promoteTarget], 'promote');
                await reply(`👑 *Promoted!* @${promoteTarget.split('@')[0]} is now admin!`, {
                    mentions: [promoteTarget]
                });
                break;
            }
            
            case 'demote': {
                if (!isSenderAdmin) return reply(config.messages.admin);
                if (!isBotAdmin) return reply(config.messages.botAdmin);
                
                const demoteTarget = msg.message?.extendedTextMessage?.contextInfo?.participant ||
                                    (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
                
                if (!demoteTarget) return reply(`Usage: ${prefix}demote @user`);
                
                await sock.groupParticipantsUpdate(from, [demoteTarget], 'demote');
                await reply(`📉 *Demoted!* @${demoteTarget.split('@')[0]} is no longer admin.`, {
                    mentions: [demoteTarget]
                });
                break;
            }
            
            case 'mute': {
                if (!isSenderAdmin) return reply(config.messages.admin);
                if (!isBotAdmin) return reply(config.messages.botAdmin);
                
                await sock.groupSettingUpdate(from, 'announcement');
                await reply('🔇 *Group muted!*\n\n_Only admins can send messages now._\n\n*GODFATHER XMD*');
                break;
            }
            
            case 'unmute': {
                if (!isSenderAdmin) return reply(config.messages.admin);
                if (!isBotAdmin) return reply(config.messages.botAdmin);
                
                await sock.groupSettingUpdate(from, 'not_announcement');
                await reply('🔊 *Group unmuted!*\n\n_Everyone can send messages now._\n\n*GODFATHER XMD*');
                break;
            }
            
            case 'tagall':
            case 'everyone': {
                if (!isSenderAdmin) return reply(config.messages.admin);
                
                let tagMsg = `╔══════════════════════╗
║    📢 *TAG ALL*          ║
╠══════════════════════╣
║                          ║
║  📝 ${text || 'No message'}
║                          ║`;
                
                const mentions = [];
                for (const participant of participants) {
                    tagMsg += `\n║  👤 @${participant.id.split('@')[0]}`;
                    mentions.push(participant.id);
                }
                
                tagMsg += `\n║                          ║
╚══════════════════════╝
*GODFATHER XMD* by Soham`;
                
                await sock.sendMessage(from, {
                    text: tagMsg,
                    mentions
                }, { quoted: msg });
                break;
            }
            
            case 'hidetag': {
                if (!isSenderAdmin) return reply(config.messages.admin);
                
                const mentions2 = participants.map(p => p.id);
                
                await sock.sendMessage(from, {
                    text: text || '📢 *Attention Everyone!*',
                    mentions: mentions2
                }, { quoted: msg });
                break;
            }
            
            case 'groupinfo': {
                const info = `╔══════════════════════╗
║   📋 *GROUP INFO*        ║
╠══════════════════════╣
║                          ║
║  📛 Name: ${groupMetadata.subject}
║  📝 Desc: ${groupMetadata.desc || 'No description'}
║  👥 Members: ${participants.length}
║  👑 Admins: ${groupAdmins.length}
║  🆔 ID: ${from}
║  📅 Created: ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}
║  👤 Creator: @${groupMetadata.owner?.split('@')[0] || 'Unknown'}
║                          ║
╚══════════════════════╝
*GODFATHER XMD* by Soham`;
                
                await sock.sendMessage(from, {
                    text: info,
                    mentions: [groupMetadata.owner]
                }, { quoted: msg });
                break;
            }
            
            case 'setname': {
                if (!isSenderAdmin) return reply(config.messages.admin);
                if (!isBotAdmin) return reply(config.messages.botAdmin);
                if (!text) return reply(`Usage: ${prefix}setname <new name>`);
                
                await sock.groupUpdateSubject(from, text);
                await reply(`✅ *Group name changed to:* ${text}`);
                break;
            }
            
            case 'setdesc': {
                if (!isSenderAdmin) return reply(config.messages.admin);
                if (!isBotAdmin) return reply(config.messages.botAdmin);
                if (!text) return reply(`Usage: ${prefix}setdesc <new description>`);
                
                await sock.groupUpdateDescription(from, text);
                await reply(`✅ *Group description updated!*`);
                break;
            }
            
            case 'link': {
                if (!isSenderAdmin) return reply(config.messages.admin);
                if (!isBotAdmin) return reply(config.messages.botAdmin);
                
                const inviteCode = await sock.groupInviteCode(from);
                await reply(`🔗 *Group Link*\n\nhttps://chat.whatsapp.com/${inviteCode}\n\n_GODFATHER XMD_`);
                break;
            }
            
            case 'revoke': {
                if (!isSenderAdmin) return reply(config.messages.admin);
                if (!isBotAdmin) return reply(config.messages.botAdmin);
                
                await sock.groupRevokeInvite(from);
                await reply('✅ *Group link revoked!*\n\n_New link generated._');
                break;
            }
            
            case 'antilink': {
                if (!isSenderAdmin) return reply(config.messages.admin);
                
                const status = args[0]?.toLowerCase();
                if (!status || !['on', 'off'].includes(status)) {
                    return reply(`Usage: ${prefix}antilink <on/off>\n\nCurrent: ${config.antiLink ? 'ON' : 'OFF'}`);
                }
                
                config.antiLink = status === 'on';
                await reply(`✅ *Anti-Link ${status === 'on' ? 'enabled' : 'disabled'}!*`);
                break;
            }
            
            case 'warn': {
                if (!isSenderAdmin) return reply(config.messages.admin);
                
                const warnTarget = msg.message?.extendedTextMessage?.contextInfo?.participant ||
                                  (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
                
                if (!warnTarget) return reply(`Usage: ${prefix}warn @user`);
                
                const db = require('../lib/database');
                const database = db.getDatabase();
                
                if (!database.warnings) database.warnings = {};
                if (!database.warnings[from]) database.warnings[from] = {};
                if (!database.warnings[from][warnTarget]) database.warnings[from][warnTarget] = 0;
                
                database.warnings[from][warnTarget]++;
                db.saveDatabase(database);
                
                const warns = database.warnings[from][warnTarget];
                
                if (warns >= 3) {
                    if (isBotAdmin) {
                        await sock.groupParticipantsUpdate(from, [warnTarget], 'remove');
                        await reply(`⚠️ @${warnTarget.split('@')[0]} has been kicked!\n\n_Reason: 3/3 warnings reached._`, {
                            mentions: [warnTarget]
                        });
                        database.warnings[from][warnTarget] = 0;
                        db.saveDatabase(database);
                    } else {
                        await reply(`⚠️ @${warnTarget.split('@')[0]} has ${warns}/3 warnings!\n\n_Bot needs admin to auto-kick._`, {
                            mentions: [warnTarget]
                        });
                    }
                } else {
                    await reply(`⚠️ *Warning ${warns}/3*\n\n@${warnTarget.split('@')[0]} has been warned!\n_3 warnings = kick_`, {
                        mentions: [warnTarget]
                    });
                }
                break;
            }
            
            case 'resetwarn': {
                if (!isSenderAdmin) return reply(config.messages.admin);
                
                const resetTarget = msg.message?.extendedTextMessage?.contextInfo?.participant ||
                                   (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
                
                if (!resetTarget) return reply(`Usage: ${prefix}resetwarn @user`);
                
                const db2 = require('../lib/database');
                const database2 = db2.getDatabase();
                
                if (database2.warnings?.[from]?.[resetTarget]) {
                    database2.warnings[from][resetTarget] = 0;
                    db2.saveDatabase(database2);
                }
                
                await reply(`✅ Warnings reset for @${resetTarget.split('@')[0]}`, {
                    mentions: [resetTarget]
                });
                break;
            }
            
            case 'leave': {
                if (!isOwner) return reply(config.messages.owner);
                
                await reply('👋 *Goodbye!*\n\n_GODFATHER XMD leaving this group._');
                await sock.groupLeave(from);
                break;
            }
            
            case 'group': {
                if (!isSenderAdmin) return reply(config.messages.admin);
                if (!isBotAdmin) return reply(config.messages.botAdmin);
                
                const action = args[0]?.toLowerCase();
                if (!action || !['open', 'close'].includes(action)) {
                    return reply(`Usage: ${prefix}group <open/close>`);
                }
                
                if (action === 'close') {
                    await sock.groupSettingUpdate(from, 'announcement');
                    await reply('🔒 *Group closed!*\n_Only admins can send messages._');
                } else {
                    await sock.groupSettingUpdate(from, 'not_announcement');
                    await reply('🔓 *Group opened!*\n_Everyone can send messages._');
                }
                break;
            }
        }
    }
};