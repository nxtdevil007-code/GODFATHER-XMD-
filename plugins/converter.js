const config = require('../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');

module.exports = {
    commands: ['toaudio', 'tomp3', 'tovn', 'toptt', 'togif'],
    category: 'Converter',
    handler: async (ctx) => {
        const { sock, msg, from, command, args, text, reply, react, prefix } = ctx;
        
        switch (command) {
            case 'toaudio':
            case 'tomp3': {
                const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const isVideo = msg.message?.videoMessage || quotedMsg?.videoMessage;
                const isAudio = msg.message?.audioMessage || quotedMsg?.audioMessage;
                
                if (!isVideo && !isAudio) {
                    return reply(`Usage: Reply to a video/audio with ${prefix}toaudio`);
                }
                
                await react('⏳');
                await reply(config.messages.wait);
                
                try {
                    const buffer = await downloadMediaMessage(
                        quotedMsg ? { ...msg, message: quotedMsg } : msg,
                        'buffer',
                        {}
                    );
                    
                    await sock.sendMessage(from, {
                        audio: buffer,
                        mimetype: 'audio/mpeg'
                    }, { quoted: msg });
                    
                    await react('✅');
                } catch (err) {
                    await reply(`❌ Conversion failed: ${err.message}`);
                }
                break;
            }
            
            case 'tovn':
            case 'toptt': {
                const quotedMsg2 = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const hasAudio = msg.message?.audioMessage || quotedMsg2?.audioMessage ||
                                msg.message?.videoMessage || quotedMsg2?.videoMessage;
                
                if (!hasAudio) {
                    return reply(`Usage: Reply to an audio/video with ${prefix}tovn`);
                }
                
                await react('⏳');
                
                try {
                    const buffer = await downloadMediaMessage(
                        quotedMsg2 ? { ...msg, message: quotedMsg2 } : msg,
                        'buffer',
                        {}
                    );
                    
                    await sock.sendMessage(from, {
                        audio: buffer,
                        mimetype: 'audio/ogg; codecs=opus',
                        ptt: true
                    }, { quoted: msg });
                    
                    await react('✅');
                } catch (err) {
                    await reply(`❌ Conversion failed: ${err.message}`);
                }
                break;
            }
            
            case 'togif': {
                const quotedMsg3 = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const isSticker = quotedMsg3?.stickerMessage;
                const isVideo2 = msg.message?.videoMessage || quotedMsg3?.videoMessage;
                
                if (!isSticker && !isVideo2) {
                    return reply(`Usage: Reply to a sticker/video with ${prefix}togif`);
                }
                
                await react('⏳');
                
                try {
                    const buffer = await downloadMediaMessage(
                        quotedMsg3 ? { ...msg, message: quotedMsg3 } : msg,
                        'buffer',
                        {}
                    );
                    
                    await sock.sendMessage(from, {
                        video: buffer,
                        gifPlayback: true,
                        caption: '🎬 *Converted to GIF!*\n\n_GODFATHER XMD_'
                    }, { quoted: msg });
                    
                    await react('✅');
                } catch (err) {
                    await reply(`❌ Conversion failed: ${err.message}`);
                }
                break;
            }
        }
    }
};