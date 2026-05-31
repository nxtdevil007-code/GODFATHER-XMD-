const config = require('../config');
const fs = require('fs');
const axios = require('axios');
const chalk = require('chalk');

function parseMessage(msg) {
    try {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const isOwnerMsg = config.ownerNumber.includes(sender.replace('@s.whatsapp.net', '')) ||
                           config.ownerNumber.includes(sender.replace(/:.*@/, '@').replace('@s.whatsapp.net', ''));
        
        const pushName = msg.pushName || 'User';
        const type = Object.keys(msg.message || {})[0];
        
        let body = '';
        switch (type) {
            case 'conversation':
                body = msg.message.conversation;
                break;
            case 'extendedTextMessage':
                body = msg.message.extendedTextMessage.text;
                break;
            case 'imageMessage':
                body = msg.message.imageMessage.caption || '';
                break;
            case 'videoMessage':
                body = msg.message.videoMessage.caption || '';
                break;
            case 'documentMessage':
                body = msg.message.documentMessage.caption || '';
                break;
            case 'buttonsResponseMessage':
                body = msg.message.buttonsResponseMessage.selectedButtonId || '';
                break;
            case 'listResponseMessage':
                body = msg.message.listResponseMessage.singleSelectReply.selectedRowId || '';
                break;
            case 'templateButtonReplyMessage':
                body = msg.message.templateButtonReplyMessage.selectedId || '';
                break;
            default:
                body = '';
        }
        
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const isMedia = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'].includes(type);
        
        return {
            from,
            sender,
            senderName: pushName,
            body,
            isGroup,
            isOwnerMsg,
            type,
            pushName,
            quoted,
            mentionedJid,
            isMedia
        };
    } catch (err) {
        return null;
    }
}

async function isAdmin(sock, groupJid, userJid) {
    try {
        const groupMetadata = await sock.groupMetadata(groupJid);
        const participant = groupMetadata.participants.find(p => p.id === userJid);
        return participant?.admin === 'admin' || participant?.admin === 'superadmin';
    } catch {
        return false;
    }
}

async function isBotAdmin(sock, groupJid) {
    try {
        const groupMetadata = await sock.groupMetadata(groupJid);
        const botId = sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net';
        const participant = groupMetadata.participants.find(p => p.id === botId);
        return participant?.admin === 'admin' || participant?.admin === 'superadmin';
    } catch {
        return false;
    }
}

function isOwner(sender) {
    return config.ownerNumber.includes(sender.replace('@s.whatsapp.net', ''));
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

function runtime(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    
    const dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
    const hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
    const mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
    const sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
    
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

async function getBuffer(url) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        return Buffer.from(response.data);
    } catch (err) {
        throw new Error('Failed to fetch buffer: ' + err.message);
    }
}

async function fetchJson(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        return response.data;
    } catch (err) {
        throw new Error('Failed to fetch JSON: ' + err.message);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandom(ext) {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
}

module.exports = {
    parseMessage,
    isAdmin,
    isBotAdmin,
    isOwner,
    formatBytes,
    formatDuration,
    runtime,
    getBuffer,
    fetchJson,
    sleep,
    getRandom
};