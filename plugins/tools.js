const config = require('../config');
const axios = require('axios');
const { weather, shortenUrl, wikipedia } = require('../lib/scraper');

module.exports = {
    commands: [
        'tts', 'translate', 'calc', 'calculator', 'weather', 'shorturl',
        'wiki', 'wikipedia', 'qr', 'base64encode', 'base64decode',
        'count', 'wordcount'
    ],
    category: 'Tools',
    handler: async (ctx) => {
        const { sock, msg, from, command, args, text, reply, react, prefix } = ctx;
        
        switch (command) {
            case 'tts': {
                if (!text) return reply(`Usage: ${prefix}tts <text>\n\nExample: ${prefix}tts Hello World`);
                
                const lang = args[0]?.length === 2 ? args[0] : 'en';
                const ttsText = lang === args[0] ? args.slice(1).join(' ') : text;
                
                try {
                    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(ttsText)}&tl=${lang}&client=tw-ob`;
                    const response = await axios.get(ttsUrl, {
                        responseType: 'arraybuffer',
                        headers: {
                            'User-Agent': 'Mozilla/5.0'
                        }
                    });
                    
                    await sock.sendMessage(from, {
                        audio: Buffer.from(response.data),
                        mimetype: 'audio/mpeg',
                        ptt: true
                    }, { quoted: msg });
                } catch (err) {
                    await reply(`❌ TTS failed: ${err.message}`);
                }
                break;
            }
            
            case 'translate': {
                if (!text) return reply(`Usage: ${prefix}translate <lang> <text>\n\nExample: ${prefix}translate es Hello World`);
                
                const targetLang = args[0] || 'en';
                const translateText = args.slice(1).join(' ') || 
                    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation || '';
                
                if (!translateText) return reply('Please provide text to translate!');
                
                try {
                    const { data } = await axios.get(
                        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(translateText)}`
                    );
                    
                    const translated = data[0].map(item => item[0]).join('');
                    const detectedLang = data[2];
                    
                    await reply(`🌐 *Translation*\n\n📝 Original (${detectedLang}): ${translateText}\n\n📝 Translated (${targetLang}): ${translated}\n\n_GODFATHER XMD_`);
                } catch (err) {
                    await reply(`❌ Translation failed: ${err.message}`);
                }
                break;
            }
            
            case 'calc':
            case 'calculator': {
                if (!text) return reply(`Usage: ${prefix}calc <expression>\n\nExample: ${prefix}calc 2+2*5`);
                
                try {
                    // Safe math evaluation
                    const sanitized = text.replace(/[^0-9+\-*/().%\s^]/g, '');
                    const result = Function('"use strict"; return (' + sanitized + ')')();
                    
                    await reply(`🧮 *Calculator*\n\n📝 Expression: ${text}\n📊 Result: ${result}\n\n_GODFATHER XMD_`);
                } catch (err) {
                    await reply(`❌ Invalid expression: ${text}`);
                }
                break;
            }
            
            case 'weather': {
                if (!text) return reply(`Usage: ${prefix}weather <city>\n\nExample: ${prefix}weather Mumbai`);
                
                try {
                    const data = await weather(text);
                    const current = data.current_condition[0];
                    const area = data.nearest_area[0];
                    
                    const weatherText = `🌤️ *Weather Report*\n\n📍 Location: ${area.areaName[0].value}, ${area.country[0].value}\n🌡️ Temperature: ${current.temp_C}°C / ${current.temp_F}°F\n💧 Humidity: ${current.humidity}%\n💨 Wind: ${current.windspeedKmph} km/h ${current.winddir16Point}\n☁️ Condition: ${current.weatherDesc[0].value}\n🌡️ Feels Like: ${current.FeelsLikeC}°C\n👁️ Visibility: ${current.visibility} km\n☀️ UV Index: ${current.uvIndex}\n\n_GODFATHER XMD by Soham_`;
                    
                    await reply(weatherText);
                } catch (err) {
                    await reply(`❌ Weather fetch failed: ${err.message}`);
                }
                break;
            }
            
            case 'shorturl': {
                if (!text) return reply(`Usage: ${prefix}shorturl <url>\n\nExample: ${prefix}shorturl https://google.com`);
                
                try {
                    const shortened = await shortenUrl(text);
                    await reply(`🔗 *URL Shortened*\n\n📝 Original: ${text}\n🔗 Short: ${shortened}\n\n_GODFATHER XMD_`);
                } catch (err) {
                    await reply(`❌ URL shortening failed: ${err.message}`);
                }
                break;
            }
            
            case 'wiki':
            case 'wikipedia': {
                if (!text) return reply(`Usage: ${prefix}wiki <query>\n\nExample: ${prefix}wiki JavaScript`);
                
                try {
                    const result = await wikipedia(text);
                    
                    let wikiMsg = `📚 *Wikipedia*\n\n📌 *${result.title}*\n\n${result.extract}\n\n🔗 ${result.url}\n\n_GODFATHER XMD_`;
                    
                    if (result.image) {
                        const imageBuffer = await require('../lib/functions').getBuffer(result.image);
                        await sock.sendMessage(from, {
                            image: imageBuffer,
                            caption: wikiMsg
                        }, { quoted: msg });
                    } else {
                        await reply(wikiMsg);
                    }
                } catch (err) {
                    await reply(`❌ Wikipedia search failed: ${err.message}`);
                }
                break;
            }
            
            case 'qr': {
                if (!text) return reply(`Usage: ${prefix}qr <text/url>`);
                
                try {
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;
                    const buffer = await require('../lib/functions').getBuffer(qrUrl);
                    
                    await sock.sendMessage(from, {
                        image: buffer,
                        caption: `📱 *QR Code Generated*\n\n📝 Content: ${text}\n\n_GODFATHER XMD_`
                    }, { quoted: msg });
                } catch (err) {
                    await reply(`❌ QR generation failed: ${err.message}`);
                }
                break;
            }
            
            case 'base64encode': {
                if (!text) return reply(`Usage: ${prefix}base64encode <text>`);
                const encoded = Buffer.from(text).toString('base64');
                await reply(`🔐 *Base64 Encoded*\n\n${encoded}`);
                break;
            }
            
            case 'base64decode': {
                if (!text) return reply(`Usage: ${prefix}base64decode <encoded text>`);
                try {
                    const decoded = Buffer.from(text, 'base64').toString('utf-8');
                    await reply(`🔓 *Base64 Decoded*\n\n${decoded}`);
                } catch {
                    await reply('❌ Invalid base64 string!');
                }
                break;
            }
            
            case 'count':
            case 'wordcount': {
                const countText = text || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation || '';
                if (!countText) return reply(`Usage: ${prefix}count <text> or reply to a message`);
                
                const chars = countText.length;
                const words = countText.split(/\s+/).filter(w => w).length;
                const lines = countText.split('\n').length;
                const sentences = countText.split(/[.!?]+/).filter(s => s.trim()).length;
                
                await reply(`📊 *Text Statistics*\n\n📝 Characters: ${chars}\n📖 Words: ${words}\n📄 Lines: ${lines}\n📃 Sentences: ${sentences}\n\n_GODFATHER XMD_`);
                break;
            }
        }
    }
};