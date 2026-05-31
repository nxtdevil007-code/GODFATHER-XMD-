const config = require('../config');
const fs = require('fs');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const Jimp = require('jimp');

module.exports = {
    commands: ['sticker', 's', 'stiker', 'toimg', 'toimage'],
    category: 'Sticker',
    handler: async (ctx) => {
        const { sock, msg, from, command, args, text, reply, react, prefix } = ctx;
        
        switch (command) {
            case 'sticker':
            case 's':
            case 'stiker': {
                const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const isImage = msg.message?.imageMessage || quotedMsg?.imageMessage;
                const isVideo = msg.message?.videoMessage || quotedMsg?.videoMessage;
                const isSticker = quotedMsg?.stickerMessage;
                
                if (!isImage && !isVideo && !text) {
                    return reply(`📌 *Sticker Maker*\n\nUsage:\n• Send/reply to an image with ${prefix}sticker\n• Send/reply to a short video with ${prefix}sticker\n• ${prefix}sticker <text> - Text sticker\n\nOptions:\n• ${prefix}sticker pack=Name author=Name\n\n_GODFATHER XMD by Soham_`);
                }
                
                // Parse pack and author names
                let packName = config.packName;
                let authorName = config.authorName;
                
                if (text) {
                    const packMatch = text.match(/pack[=:](.+?)(?:\s|$)/i);
                    const authorMatch = text.match(/author[=:](.+?)(?:\s|$)/i);
                    if (packMatch) packName = packMatch[1].trim();
                    if (authorMatch) authorName = authorMatch[1].trim();
                }
                
                await react('⏳');
                
                if (isImage) {
                    try {
                        const buffer = await downloadMediaMessage(
                            quotedMsg ? { ...msg, message: quotedMsg } : msg,
                            'buffer',
                            {}
                        );
                        
                        // Resize for sticker
                        const image = await Jimp.read(buffer);
                        const resized = await image
                            .resize(512, 512, Jimp.RESIZE_BICUBIC)
                            .quality(80)
                            .getBufferAsync(Jimp.MIME_PNG);
                        
                        await sock.sendMessage(from, {
                            sticker: resized,
                            packname: packName,
                            author: authorName
                        }, { quoted: msg });
                        
                        await react('✅');
                    } catch (err) {
                        await reply(`❌ Sticker creation failed: ${err.message}`);
                    }
                } else if (isVideo) {
                    try {
                        const buffer = await downloadMediaMessage(
                            quotedMsg ? { ...msg, message: quotedMsg } : msg,
                            'buffer',
                            {}
                        );
                        
                        // For video stickers, send directly as webp
                        await sock.sendMessage(from, {
                            sticker: buffer,
                            packname: packName,
                            author: authorName
                        }, { quoted: msg });
                        
                        await react('✅');
                    } catch (err) {
                        await reply(`❌ Video sticker failed: ${err.message}`);
                    }
                } else if (text && !text.includes('pack') && !text.includes('author')) {
                    // Text sticker
                    try {
                        const stickerText = text;
                        const image = new Jimp(512, 512, 0x00000000);
                        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
                        
                        image.print(
                            font,
                            10,
                            10,
                            {
                                text: stickerText,
                                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                            },
                            492,
                            492
                        );
                        
                        const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
                        
                        await sock.sendMessage(from, {
                            sticker: buffer,
                            packname: packName,
                            author: authorName
                        }, { quoted: msg });
                        
                        await react('✅');
                    } catch (err) {
                        await reply(`❌ Text sticker failed: ${err.message}`);
                    }
                }
                break;
            }
            
            case 'toimg':
            case 'toimage': {
                const quotedSticker = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
                
                if (!quotedSticker) {
                    return reply(`Usage: Reply to a sticker with ${prefix}toimg`);
                }
                
                await react('⏳');
                
                try {
                    const buffer = await downloadMediaMessage(
                        { ...msg, message: { stickerMessage: quotedSticker } },
                        'buffer',
                        {}
                    );
                    
                    await sock.sendMessage(from, {
                        image: buffer,
                        caption: '🖼️ *Sticker converted to image!*\n\n_GODFATHER XMD_'
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