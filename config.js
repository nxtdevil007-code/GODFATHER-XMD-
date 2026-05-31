const fs = require('fs');
const chalk = require('chalk');

const config = {
    // Bot Configuration
    botName: 'GODFATHER XMD',
    ownerName: 'Soham',
    ownerNumber: ['919876543210'], // Change to your number
    prefix: '.',
    mode: 'public', // public, private, group
    
    // Bot Settings
    autoRead: true,
    autoTyping: true,
    autoRecording: false,
    alwaysOnline: true,
    autoReact: true,
    
    // Anti Features
    antiLink: true,
    antiBadWord: true,
    antiSpam: true,
    antiCall: true,
    
    // Welcome/Goodbye
    welcome: true,
    goodbye: true,
    
    // Limits
    downloadLimit: 100, // MB
    stickerLimit: 10, // per minute
    
    // API Keys (add your own)
    apiKeys: {
        openai: '',
        removebg: '',
        weatherApi: '',
    },
    
    // Session
    sessionId: '', // Will be auto-filled
    
    // Pack Info for Stickers
    packName: 'GODFATHER XMD',
    authorName: 'Soham',
    
    // Database
    database: './lib/database.json',
    
    // Messages
    messages: {
        wait: '⏳ *Processing your request...*',
        owner: '❌ *This command is only for the owner!*',
        admin: '❌ *This command is only for admins!*',
        botAdmin: '❌ *Bot must be admin to use this command!*',
        group: '❌ *This command can only be used in groups!*',
        private: '❌ *This command can only be used in private chat!*',
        error: '❌ *An error occurred!*',
        success: '✅ *Success!*',
    },
    
    // Emojis
    emojis: {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        loading: '⏳',
        star: '⭐',
        fire: '🔥',
        heart: '❤️',
        crown: '👑',
    }
};

module.exports = config;