const config = require('../config');
const chalk = require('chalk');

async function handleGroupEvent(sock, event) {
    const { id, participants, action } = event;
    
    if (!config.welcome && !config.goodbye) return;
    
    try {
        const groupMetadata = await sock.groupMetadata(id);
        const groupName = groupMetadata.subject;
        const groupDesc = groupMetadata.desc || 'No description';
        const memberCount = groupMetadata.participants.length;
        
        for (const participant of participants) {
            const ppUrl = await sock.profilePictureUrl(participant, 'image').catch(() => 
                'https://i.imgur.com/2wzGhpF.png'
            );
            
            const userName = participant.split('@')[0];
            
            if (action === 'add' && config.welcome) {
                const welcomeMsg = `╔══════════════════════╗
║  *WELCOME TO ${groupName}*  ║
╠══════════════════════╣
║                              ║
║  👋 Hello @${userName}!      ║
║                              ║
║  📌 Group: ${groupName}      ║
║  👥 Members: ${memberCount}  ║
║  📝 ${groupDesc.substring(0, 50)}  ║
║                              ║
║  Please read the group rules ║
║  and enjoy your stay! 🎉     ║
║                              ║
║  *Powered by GODFATHER XMD*  ║
║  *Created by Soham*          ║
╚══════════════════════╝`;
                
                await sock.sendMessage(id, {
                    image: { url: ppUrl },
                    caption: welcomeMsg,
                    mentions: [participant]
                });
                
                console.log(chalk.green(`[ WELCOME ] ${userName} joined ${groupName}`));
            }
            
            if (action === 'remove' && config.goodbye) {
                const goodbyeMsg = `╔══════════════════════╗
║     *GOODBYE* 👋            ║
╠══════════════════════╣
║                              ║
║  😢 @${userName} has left    ║
║  the group.                  ║
║                              ║
║  We'll miss you! 💔          ║
║                              ║
║  📌 Group: ${groupName}      ║
║  👥 Members: ${memberCount}  ║
║                              ║
║  *GODFATHER XMD*             ║
╚══════════════════════╝`;
                
                await sock.sendMessage(id, {
                    image: { url: ppUrl },
                    caption: goodbyeMsg,
                    mentions: [participant]
                });
                
                console.log(chalk.yellow(`[ GOODBYE ] ${userName} left ${groupName}`));
            }
            
            if (action === 'promote') {
                await sock.sendMessage(id, {
                    text: `👑 *Congratulations!*\n\n@${userName} has been promoted to admin!\n\n*- GODFATHER XMD*`,
                    mentions: [participant]
                });
            }
            
            if (action === 'demote') {
                await sock.sendMessage(id, {
                    text: `📉 @${userName} has been demoted from admin.\n\n*- GODFATHER XMD*`,
                    mentions: [participant]
                });
            }
        }
    } catch (err) {
        console.log(chalk.red('[ ERROR ] Group Event:', err.message));
    }
}

module.exports = { handleGroupEvent };