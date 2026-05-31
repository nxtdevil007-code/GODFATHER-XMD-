const config = require('../config');
const axios = require('axios');

module.exports = {
    commands: ['ai', 'gpt', 'chatgpt', 'ask', 'gemini', 'imagine'],
    category: 'AI',
    handler: async (ctx) => {
        const { sock, msg, from, command, args, text, reply, react, prefix } = ctx;
        
        switch (command) {
            case 'ai':
            case 'gpt':
            case 'chatgpt':
            case 'ask': {
                if (!text) return reply(`🤖 *GODFATHER XMD AI*\n\nUsage: ${prefix}ai <your question>\n\nExample: ${prefix}ai What is JavaScript?\n\n_Powered by GODFATHER XMD_`);
                
                await react('🤖');
                await reply('🤖 *Thinking...*');
                
                try {
                    // Using free AI API alternatives
                    let aiResponse = '';
                    
                    // Try multiple free AI APIs
                    try {
                        const { data } = await axios.post('https://api.openai.com/v1/chat/completions', {
                            model: 'gpt-3.5-turbo',
                            messages: [
                                {
                                    role: 'system',
                                    content: 'You are GODFATHER XMD, a helpful WhatsApp bot assistant created by Soham. Be friendly, helpful, and concise.'
                                },
                                { role: 'user', content: text }
                            ],
                            max_tokens: 1000
                        }, {
                            headers: {
                                'Authorization': `Bearer ${config.apiKeys.openai}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        aiResponse = data.choices[0].message.content;
                    } catch {
                        // Fallback: Use a simple response system
                        aiResponse = generateSimpleResponse(text);
                    }
                    
                    await reply(`🤖 *GODFATHER XMD AI*\n\n${aiResponse}\n\n_Powered by GODFATHER XMD_\n_Created by Soham_`);
                    await react('✅');
                } catch (err) {
                    await reply(`❌ AI Error: ${err.message}\n\n_Try again later._`);
                }
                break;
            }
            
            case 'gemini': {
                if (!text) return reply(`Usage: ${prefix}gemini <your question>`);
                
                await react('🤖');
                await reply('🤖 *Gemini is thinking...*');
                
                try {
                    const response = generateSimpleResponse(text);
                    await reply(`🤖 *GODFATHER XMD - Gemini*\n\n${response}\n\n_GODFATHER XMD by Soham_`);
                    await react('✅');
                } catch (err) {
                    await reply(`❌ Error: ${err.message}`);
                }
                break;
            }
            
            case 'imagine': {
                if (!text) return reply(`Usage: ${prefix}imagine <prompt>\n\nExample: ${prefix}imagine a beautiful sunset over mountains`);
                
                await react('🎨');
                await reply('🎨 *Generating image...*\n\n_This may take a moment._');
                
                try {
                    // Using Pollinations AI for free image generation
                    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=1024&height=1024&nologo=true`;
                    
                    const { getBuffer } = require('../lib/functions');
                    const buffer = await getBuffer(imageUrl);
                    
                    await sock.sendMessage(from, {
                        image: buffer,
                        caption: `🎨 *AI Generated Image*\n\n📝 Prompt: ${text}\n\n_GODFATHER XMD by Soham_`
                    }, { quoted: msg });
                    
                    await react('✅');
                } catch (err) {
                    await reply(`❌ Image generation failed: ${err.message}`);
                }
                break;
            }
        }
    }
};

// Simple AI response generator (fallback)
function generateSimpleResponse(question) {
    const q = question.toLowerCase();
    
    // Greetings
    if (q.match(/^(hi|hello|hey|hola|yo)\b/)) {
        return "Hello! 👋 I'm GODFATHER XMD, your AI assistant created by Soham. How can I help you today?";
    }
    
    // About bot
    if (q.includes('who are you') || q.includes('what are you')) {
        return "I'm GODFATHER XMD, a multi-device WhatsApp bot created by Soham. I can help with various tasks like group management, downloads, AI chat, and more!";
    }
    
    // Creator
    if (q.includes('who created you') || q.includes('who made you') || q.includes('developer')) {
        return "I was created by Soham! He's an amazing developer who built me with love and JavaScript. 👑";
    }
    
    // Time
    if (q.includes('time') || q.includes('what time')) {
        return `The current time is ${new Date().toLocaleString()}. ⏰`;
    }
    
    // Date
    if (q.includes('date') || q.includes('what day')) {
        return `Today's date is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. 📅`;
    }
    
    // Math
    if (q.match(/what is \d+[\+\-\*\/]\d+/)) {
        try {
            const expr = q.match(/\d+[\+\-\*\/]\d+/)[0];
            const result = eval(expr);
            return `The answer is: ${result} 🧮`;
        } catch {
            return "I couldn't calculate that. Please try a simpler expression.";
        }
    }
    
    // Default response
    const responses = [
        `That's an interesting question! While I'm a simple AI, I'll do my best. Regarding "${question}" - I'd suggest researching this topic further for a comprehensive answer. 🤔`,
        `Great question! "${question}" is something many people wonder about. For the most accurate information, I'd recommend checking reliable sources online. 📚`,
        `I appreciate your curiosity about "${question}"! As GODFATHER XMD AI, I try my best, but for detailed answers, consider using a search engine or specialized AI. 🌟`,
        `Hmm, "${question}" is quite thought-provoking! I'm still learning, but I'm here to help. Feel free to ask me anything else! 💡`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}