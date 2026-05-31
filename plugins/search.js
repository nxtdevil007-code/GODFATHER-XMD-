const config = require('../config');
const { googleSearch, lyrics, wikipedia } = require('../lib/scraper');
const ytSearch = require('yt-search');
const { getBuffer } = require('../lib/functions');

module.exports = {
    commands: ['google', 'search', 'lyrics', 'image', 'github', 'imdb'],
    category: 'Search',
    handler: async (ctx) => {
        const { sock, msg, from, command, args, text, reply, react, prefix } = ctx;
        
        switch (command) {
            case 'google':
            case 'search': {
                if (!text) return reply(`Usage: ${prefix}google <query>\n\nExample: ${prefix}google What is Node.js`);
                
                await react('🔍');
                
                try {
                    const results = await googleSearch(text);
                    
                    if (!results.length) return reply('❌ No results found!');
                    
                    let resultText = `🔍 *Google Search*\n\n📝 Query: ${text}\n\n`;
                    
                    results.slice(0, 5).forEach((result, i) => {
                        resultText += `*${i + 1}. ${result.title}*\n`;
                        resultText += `📎 ${result.link}\n`;
                        if (result.snippet) resultText += `📝 ${result.snippet}\n`;
                        resultText += '\n';
                    });
                    
                    resultText += `_GODFATHER XMD by Soham_`;
                    
                    await reply(resultText);
                    await react('✅');
                } catch (err) {
                    await reply(`❌ Search failed: ${err.message}`);
                }
                break;
            }
            
            case 'lyrics': {
                if (!text) return reply(`Usage: ${prefix}lyrics <artist - song name>\n\nExample: ${prefix}lyrics Alan Walker - Faded`);
                
                await react('🎵');
                await reply('🎵 *Searching lyrics...*');
                
                try {
                    const result = await lyrics(text);
                    
                    if (result.length > 4000) {
                        // Split long lyrics
                        const parts = result.match(/.{1,3500}/gs);
                        for (let i = 0; i < parts.length; i++) {
                            await reply(`🎵 *Lyrics - ${text}* (Part ${i + 1}/${parts.length})\n\n${parts[i]}\n\n_GODFATHER XMD_`);
                        }
                    } else {
                        await reply(`🎵 *Lyrics*\n\n📌 ${text}\n\n${result}\n\n_GODFATHER XMD by Soham_`);
                    }
                    
                    await react('✅');
                } catch (err) {
                    await reply(`❌ Lyrics not found: ${err.message}`);
                }
                break;
            }
            
            case 'image': {
                if (!text) return reply(`Usage: ${prefix}image <query>\n\nExample: ${prefix}image cute cats`);
                
                await react('🖼️');
                await reply('🔍 *Searching images...*');
                
                try {
                    // Using a free image search API
                    const imageUrl = `https://source.unsplash.com/random/1080x1080/?${encodeURIComponent(text)}`;
                    const buffer = await getBuffer(imageUrl);
                    
                    await sock.sendMessage(from, {
                        image: buffer,
                        caption: `🖼️ *Image Search*\n\n📝 Query: ${text}\n\n_GODFATHER XMD by Soham_`
                    }, { quoted: msg });
                    
                    await react('✅');
                } catch (err) {
                    await reply(`❌ Image search failed: ${err.message}`);
                }
                break;
            }
            
            case 'github': {
                if (!text) return reply(`Usage: ${prefix}github <username>\n\nExample: ${prefix}github soham`);
                
                await react('🔍');
                
                try {
                    const axios = require('axios');
                    const { data } = await axios.get(`https://api.github.com/users/${text}`);
                    
                    const ghInfo = `💻 *GitHub Profile*\n\n👤 Name: ${data.name || 'N/A'}\n📛 Username: ${data.login}\n📝 Bio: ${data.bio || 'No bio'}\n📍 Location: ${data.location || 'N/A'}\n🏢 Company: ${data.company || 'N/A'}\n📦 Public Repos: ${data.public_repos}\n👥 Followers: ${data.followers}\n👤 Following: ${data.following}\n📅 Joined: ${new Date(data.created_at).toLocaleDateString()}\n🔗 URL: ${data.html_url}\n\n_GODFATHER XMD by Soham_`;
                    
                    if (data.avatar_url) {
                        const buffer = await getBuffer(data.avatar_url);
                        await sock.sendMessage(from, {
                            image: buffer,
                            caption: ghInfo
                        }, { quoted: msg });
                    } else {
                        await reply(ghInfo);
                    }
                    
                    await react('✅');
                } catch (err) {
                    await reply(`❌ GitHub user not found: ${err.message}`);
                }
                break;
            }
        }
    }
};