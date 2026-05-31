const config = require('../config');
const os = require('os');
const { runtime } = require('../lib/functions');

module.exports = {
    commands: ['menu', 'help', 'list', 'commands', 'cmd'],
    category: 'General',
    description: 'Show bot menu',
    handler: async (ctx) => {
        const { reply, sender, senderName, isGroup, prefix } = ctx;
        
        const uptimeSeconds = process.uptime();
        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const usedMem = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);
        const platform = os.platform();
        const cpus = os.cpus().length;
        
        const menuText = `
╔══════════════════════════╗
║    👑 *GODFATHER XMD* 👑    ║
║    _Multi-Device Bot_        ║
║    Created by *Soham*        ║
╠══════════════════════════╣
║                              ║
║  👤 User: ${senderName}     ║
║  ⏰ Uptime: ${runtime(uptimeSeconds)} ║
║  💻 Platform: ${platform}   ║
║  🧠 RAM: ${usedMem}/${totalMem} GB ║
║  ⚡ CPU Cores: ${cpus}      ║
║  📌 Prefix: ${prefix}       ║
║  📡 Mode: ${config.mode}    ║
║                              ║
╠══════════════════════════╣
║                              ║
║  📋 *GENERAL COMMANDS*       ║
║  ├ ${prefix}menu - Bot menu  ║
║  ├ ${prefix}ping - Bot speed ║
║  ├ ${prefix}info - Bot info  ║
║  ├ ${prefix}owner - Owner    ║
║  ├ ${prefix}runtime - Uptime ║
║  ├ ${prefix}speed - Speed    ║
║  └ ${prefix}script - Source  ║
║                              ║
║  🛠️ *TOOLS COMMANDS*         ║
║  ├ ${prefix}sticker - Make sticker ║
║  ├ ${prefix}toimg - Sticker to image ║
║  ├ ${prefix}tts - Text to speech ║
║  ├ ${prefix}translate - Translate ║
║  ├ ${prefix}calc - Calculator ║
║  ├ ${prefix}weather - Weather ║
║  ├ ${prefix}shorturl - Shorten URL ║
║  ├ ${prefix}wiki - Wikipedia ║
║  └ ${prefix}qr - Generate QR ║
║                              ║
║  ⬇️ *DOWNLOAD COMMANDS*      ║
║  ├ ${prefix}play - Play song ║
║  ├ ${prefix}song - Download song ║
║  ├ ${prefix}video - Download video ║
║  ├ ${prefix}ytmp3 - YT to MP3 ║
║  ├ ${prefix}ytmp4 - YT to MP4 ║
║  ├ ${prefix}ig - Instagram DL ║
║  ├ ${prefix}tiktok - TikTok DL ║
║  └ ${prefix}fb - Facebook DL ║
║                              ║
║  👥 *GROUP COMMANDS*         ║
║  ├ ${prefix}kick - Kick member ║
║  ├ ${prefix}add - Add member ║
║  ├ ${prefix}promote - Promote ║
║  ├ ${prefix}demote - Demote  ║
║  ├ ${prefix}mute - Mute group ║
║  ├ ${prefix}unmute - Unmute  ║
║  ├ ${prefix}tagall - Tag all ║
║  ├ ${prefix}hidetag - Hide tag ║
║  ├ ${prefix}groupinfo - Info ║
║  ├ ${prefix}setname - Set name ║
║  ├ ${prefix}setdesc - Set desc ║
║  ├ ${prefix}link - Group link ║
║  ├ ${prefix}revoke - Revoke link ║
║  ├ ${prefix}antilink - Anti link ║
║  └ ${prefix}warn - Warn user ║
║                              ║
║  🎮 *FUN COMMANDS*           ║
║  ├ ${prefix}joke - Random joke ║
║  ├ ${prefix}quote - Random quote ║
║  ├ ${prefix}fact - Random fact ║
║  ├ ${prefix}dare - Dare     ║
║  ├ ${prefix}truth - Truth   ║
║  ├ ${prefix}8ball - Magic 8ball ║
║  ├ ${prefix}roll - Roll dice ║
║  ├ ${prefix}flip - Flip coin ║
║  ├ ${prefix}meme - Random meme ║
║  ├ ${prefix}ship - Ship users ║
║  └ ${prefix}rate - Rate user ║
║                              ║
║  🤖 *AI COMMANDS*            ║
║  ├ ${prefix}ai - Chat with AI ║
║  ├ ${prefix}gpt - GPT AI    ║
║  ├ ${prefix}imagine - AI image ║
║  └ ${prefix}gemini - Gemini AI ║
║                              ║
║  🔍 *SEARCH COMMANDS*        ║
║  ├ ${prefix}google - Google  ║
║  ├ ${prefix}ytsearch - YouTube ║
║  ├ ${prefix}lyrics - Song lyrics ║
║  ├ ${prefix}image - Image search ║
║  └ ${prefix}github - GitHub ║
║                              ║
║  🔒 *OWNER COMMANDS*        ║
║  ├ ${prefix}ban - Ban user   ║
║  ├ ${prefix}unban - Unban    ║
║  ├ ${prefix}broadcast - BC   ║
║  ├ ${prefix}block - Block    ║
║  ├ ${prefix}unblock - Unblock ║
║  ├ ${prefix}setprefix - Prefix ║
║  ├ ${prefix}setmode - Mode   ║
║  ├ ${prefix}restart - Restart ║
║  ├ ${prefix}shutdown - Stop  ║
║  ├ ${prefix}eval - Evaluate  ║
║  ├ ${prefix}exec - Execute   ║
║  ├ ${prefix}premium - Premium ║
║  ├ ${prefix}session - Session ║
║  └ ${prefix}clearsession - Clear ║
║                              ║
║  🎨 *CONVERTER COMMANDS*    ║
║  ├ ${prefix}toaudio - To audio ║
║  ├ ${prefix}tomp3 - To MP3   ║
║  ├ ${prefix}tovn - To voice  ║
║  ├ ${prefix}toptt - To PTT   ║
║  └ ${prefix}togif - To GIF   ║
║                              ║
╠══════════════════════════╣
║  Total Commands: 65+         ║
║                              ║
║  *© GODFATHER XMD v3.0*     ║
║  *Created by Soham* 👑       ║
╚══════════════════════════╝`;
        
        await reply(menuText);
    }
};