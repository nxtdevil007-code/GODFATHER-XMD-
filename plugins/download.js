const config = require('../config');
const ytSearch = require('yt-search');
const { getBuffer } = require('../lib/functions');

module.exports = {
    commands: ['play', 'song', 'video', 'ytmp3', 'ytmp4', 'ytsearch'],
    category: 'Download',
    handler: async (ctx) => {
        const { sock, msg, from, command, args, text, reply, react, prefix } = ctx;
        
        switch (command) {
            case 'play':
            case 'song': {
                if (!text) return reply(`Usage: ${prefix}play <song name>\n\nExample: ${prefix}play Faded Alan Walker`);
                
                await react('⏳');
                await reply(config.messages.wait);
                
                try {
                    const search = await ytSearch(text);
                    
                    if (!search.videos.length) {
                        return reply('❌ No results found!');
                    }
                    
                    const video = search.videos[0];
                    
                    const infoText = `🎵 *GODFATHER XMD Music Player*\n\n📌 Title: ${video.title}\n⏱️ Duration: ${video.timestamp}\n👁️ Views: ${video.views?.toLocaleString()}\n📅 Published: ${video.ago}\n🔗 URL: ${video.url}\n👤 Channel: ${video.author.name}\n\n⏳ _Downloading audio..._\n\n_GODFATHER XMD by Soham_`;
                    
                    if (video.thumbnail) {
                        await sock.sendMessage(from, {
                            image: { url: video.thumbnail },
                            caption: infoText
                        }, { quoted: msg });
                    } else {
                        await reply(infoText);
                    }
                    
                    // Note: Actual audio download requires additional API/service
                    await reply(`🎵 *Download Link:*\n\n${video.url}\n\n_Use a YouTube downloader service to get the audio._\n_GODFATHER XMD_`);
                    
                    await react('✅');
                } catch (err) {
                    await reply(`❌ Error: ${err.message}`);
                }
                break;
            }
            
            case 'video':
            case 'ytmp4': {
                if (!text) return reply(`Usage: ${prefix}video <video name>\n\nExample: ${prefix}video Faded Alan Walker`);
                
                await react('⏳');
                await reply(config.messages.wait);
                
                try {
                    const search = await ytSearch(text);
                    
                    if (!search.videos.length) {
                        return reply('❌ No results found!');
                    }
                    
                    const video = search.videos[0];
                    
                    const infoText = `🎬 *GODFATHER XMD Video Player*\n\n📌 Title: ${video.title}\n⏱️ Duration: ${video.timestamp}\n👁️ Views: ${video.views?.toLocaleString()}\n📅 Published: ${video.ago}\n🔗 URL: ${video.url}\n👤 Channel: ${video.author.name}\n\n_GODFATHER XMD by Soham_`;
                    
                    if (video.thumbnail) {
                        await sock.sendMessage(from, {
                            image: { url: video.thumbnail },
                            caption: infoText
                        }, { quoted: msg });
                    } else {
                        await reply(infoText);
                    }
                    
                    await react('✅');
                } catch (err) {
                    await reply(`❌ Error: ${err.message}`);
                }
                break;
            }
            
            case 'ytsearch': {
                if (!text) return reply(`Usage: ${prefix}ytsearch <query>`);
                
                await react('⏳');
                
                try {
                    const search = await ytSearch(text);
                    const videos = search.videos.slice(0, 10);
                    
                    if (!videos.length) return reply('❌ No results found!');
                    
                    let resultText = `🔍 *YouTube Search Results*\n\n📝 Query: ${text}\n\n`;
                    
                    videos.forEach((video, i) => {
                        resultText += `*${i + 1}.* ${video.title}\n`;
                        resultText += `   ⏱️ ${video.timestamp} | 👁️ ${video.views?.toLocaleString()}\n`;
                        resultText += `   🔗 ${video.url}\n\n`;
                    });
                    
                    resultText += `\n_GODFATHER XMD by Soham_`;
                    
                    await reply(resultText);
                    await react('✅');
                } catch (err) {
                    await reply(`❌ Search failed: ${err.message}`);
                }
                break;
            }
            
            case 'ytmp3': {
                if (!text) return reply(`Usage: ${prefix}ytmp3 <YouTube URL>`);
                
                await react('⏳');
                await reply(`⏳ *Processing...*\n\n🔗 URL: ${text}\n\n_Please wait, this may take a moment._\n\n_GODFATHER XMD_`);
                
                try {
                    // Get video info
                    const search = await ytSearch({ videoId: text.match(/(?:youtu\.be\/|v=)([^&\s]+)/)?.[1] || text });
                    
                    await reply(`🎵 *YouTube to MP3*\n\n📌 Title: ${search?.title || 'Unknown'}\n\n_Audio download requires external API._\n_GODFATHER XMD by Soham_`);
                    
                    await react('✅');
                } catch (err) {
                    await reply(`❌ Error: ${err.message}`);
                }
                break;
            }
        }
    }
};