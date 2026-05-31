const config = require('../config');

module.exports = {
    commands: [
        'joke', 'quote', 'fact', 'dare', 'truth', '8ball', 'eightball',
        'roll', 'dice', 'flip', 'coin', 'meme', 'ship', 'rate',
        'hack', 'gay', 'simp', 'roast', 'pickup', 'compliment'
    ],
    category: 'Fun',
    handler: async (ctx) => {
        const { sock, msg, from, sender, command, args, text, reply, react, prefix, mentionedJid, senderName } = ctx;
        
        switch (command) {
            case 'joke': {
                const jokes = [
                    "Why don't scientists trust atoms? Because they make up everything! 😂",
                    "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
                    "Why don't eggs tell jokes? They'd crack each other up! 🥚",
                    "What do you call a bear with no teeth? A gummy bear! 🐻",
                    "Why did the coffee file a police report? It got mugged! ☕",
                    "What do you call a fake noodle? An impasta! 🍝",
                    "Why did the bicycle fall over? Because it was two tired! 🚲",
                    "What do you call a lazy kangaroo? A pouch potato! 🦘",
                    "Why did the math book look so sad? It had too many problems! 📕",
                    "What do you call a snowman with a six-pack? An abdominal snowman! ⛄"
                ];
                
                const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
                await reply(`😂 *Random Joke*\n\n${randomJoke}\n\n_GODFATHER XMD_`);
                break;
            }
            
            case 'quote': {
                const quotes = [
                    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
                    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
                    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
                    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
                    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
                    { text: "Success is not final, failure is not fatal. It is the courage to continue that counts.", author: "Winston Churchill" },
                    { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
                    { text: "Two things are infinite: the universe and human stupidity.", author: "Albert Einstein" },
                    { text: "In three words I can sum up everything I've learned about life: it goes on.", author: "Robert Frost" },
                    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" }
                ];
                
                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                await reply(`💫 *Random Quote*\n\n_"${randomQuote.text}"_\n\n— ${randomQuote.author}\n\n_GODFATHER XMD_`);
                break;
            }
            
            case 'fact': {
                const facts = [
                    "Honey never spoils. Archaeologists have found 3000-year-old honey that was still edible! 🍯",
                    "Octopuses have three hearts and blue blood! 🐙",
                    "A group of flamingos is called a 'flamboyance'! 🦩",
                    "Bananas are berries, but strawberries aren't! 🍌",
                    "The shortest war in history lasted 38 minutes! ⚔️",
                    "A day on Venus is longer than a year on Venus! 🌍",
                    "Cows have best friends and get stressed when separated! 🐄",
                    "The human brain uses 20% of the body's total energy! 🧠",
                    "There are more stars in the universe than grains of sand on Earth! ⭐",
                    "Dolphins sleep with one eye open! 🐬"
                ];
                
                const randomFact = facts[Math.floor(Math.random() * facts.length)];
                await reply(`🤓 *Random Fact*\n\n${randomFact}\n\n_GODFATHER XMD_`);
                break;
            }
            
            case 'dare': {
                const dares = [
                    "Send a voice note singing your favorite song! 🎤",
                    "Change your profile picture to a funny photo for 1 hour! 📸",
                    "Send the last photo in your gallery! 🖼️",
                    "Type a message with your eyes closed! 👀",
                    "Send a voice note in a funny accent! 🗣️",
                    "Post your screen time! 📱",
                    "Send a selfie right now! 🤳",
                    "Compliment everyone in this chat! 💕",
                    "Send your most used emoji 10 times! 😀",
                    "Tell your most embarrassing story! 😳"
                ];
                
                const randomDare = dares[Math.floor(Math.random() * dares.length)];
                await reply(`🔥 *Dare*\n\n${randomDare}\n\n_GODFATHER XMD_`);
                break;
            }
            
            case 'truth': {
                const truths = [
                    "What's the most embarrassing thing you've done? 😳",
                    "Who was your first crush? 💕",
                    "What's the biggest lie you've ever told? 🤥",
                    "What's your guilty pleasure? 🙈",
                    "What's the last lie you told? 🤫",
                    "Who do you secretly admire? 👀",
                    "What's your biggest fear? 😨",
                    "What's the most childish thing you still do? 👶",
                    "What's the worst gift you've received? 🎁",
                    "If you could be invisible for a day, what would you do? 👻"
                ];
                
                const randomTruth = truths[Math.floor(Math.random() * truths.length)];
                await reply(`🤔 *Truth*\n\n${randomTruth}\n\n_GODFATHER XMD_`);
                break;
            }
            
            case '8ball':
            case 'eightball': {
                if (!text) return reply(`Usage: ${prefix}8ball <question>`);
                
                const responses = [
                    "🎱 It is certain.",
                    "🎱 Without a doubt.",
                    "🎱 Yes, definitely.",
                    "🎱 You may rely on it.",
                    "🎱 Most likely.",
                    "🎱 Outlook good.",
                    "🎱 Yes.",
                    "🎱 Signs point to yes.",
                    "🎱 Reply hazy, try again.",
                    "🎱 Ask again later.",
                    "🎱 Better not tell you now.",
                    "🎱 Don't count on it.",
                    "🎱 My reply is no.",
                    "🎱 My sources say no.",
                    "🎱 Very doubtful.",
                    "🎱 Outlook not so good."
                ];
                
                const response = responses[Math.floor(Math.random() * responses.length)];
                await reply(`🎱 *Magic 8 Ball*\n\n❓ Question: ${text}\n\n${response}\n\n_GODFATHER XMD_`);
                break;
            }
            
            case 'roll':
            case 'dice': {
                const sides = parseInt(args[0]) || 6;
                const result = Math.floor(Math.random() * sides) + 1;
                await reply(`🎲 *Dice Roll*\n\nRolled a ${sides}-sided dice:\n\n🎯 Result: *${result}*\n\n_GODFATHER XMD_`);
                break;
            }
            
            case 'flip':
            case 'coin': {
                const result = Math.random() < 0.5 ? 'Heads 🪙' : 'Tails 🪙';
                await reply(`🪙 *Coin Flip*\n\nResult: *${result}*\n\n_GODFATHER XMD_`);
                break;
            }
            
            case 'ship': {
                const target1 = mentionedJid[0] || sender;
                const target2 = mentionedJid[1] || (mentionedJid[0] ? sender : null);
                
                if (!target2) return reply(`Usage: ${prefix}ship @user1 @user2`);
                
                const percentage = Math.floor(Math.random() * 101);
                let emoji, status;
                
                if (percentage >= 80) { emoji = '❤️‍🔥'; status = 'Perfect Match!'; }
                else if (percentage >= 60) { emoji = '❤️'; status = 'Great Couple!'; }
                else if (percentage >= 40) { emoji = '💕'; status = 'Could Work!'; }
                else if (percentage >= 20) { emoji = '💔'; status = 'Not the Best...'; }
                else { emoji = '😢'; status = 'Not Meant to Be'; }
                
                const bar = '█'.repeat(Math.floor(percentage / 10)) + '░'.repeat(10 - Math.floor(percentage / 10));
                
                await sock.sendMessage(from, {
                    text: `💘 *Love Ship*\n\n@${target1.split('@')[0]} ❤️ @${target2.split('@')[0]}\n\n${bar} ${percentage}%\n\n${emoji} ${status}\n\n_GODFATHER XMD_`,
                    mentions: [target1, target2]
                }, { quoted: msg });
                break;
            }
            
            case 'rate': {
                const target = mentionedJid[0] || sender;
                const rating = Math.floor(Math.random() * 11);
                const stars = '⭐'.repeat(rating) + '☆'.repeat(10 - rating);
                
                await sock.sendMessage(from, {
                    text: `📊 *Rate*\n\n👤 @${target.split('@')[0]}\n\n${stars}\n\n🏆 Rating: ${rating}/10\n\n_GODFATHER XMD_`,
                    mentions: [target]
                }, { quoted: msg });
                break;
            }
            
            case 'roast': {
                const roasts = [
                    "You're like a cloud. When you disappear, it's a beautiful day! ☁️",
                    "I'd explain it to you, but I left my crayons at home. 🖍️",
                    "You're not stupid; you just have bad luck thinking. 🧠",
                    "I'm not saying you're old, but your birth certificate is in hieroglyphics. 📜",
                    "You bring everyone so much joy... when you leave. 🚪",
                    "If you were any more inbred, you'd be a sandwich. 🥪",
                    "I'd roast you, but my mom told me not to burn trash. 🗑️",
                    "You're the reason God created the middle finger. 🖕",
                    "I'd tell you to go outside, but the sun might file a restraining order. ☀️",
                    "You're proof that even evolution makes mistakes. 🐒"
                ];
                
                const roast = roasts[Math.floor(Math.random() * roasts.length)];
                await reply(`🔥 *Roast*\n\n${roast}\n\n_Just kidding! - GODFATHER XMD_`);
                break;
            }
            
            case 'pickup': {
                const pickupLines = [
                    "Are you a magician? Because whenever I look at you, everyone else disappears. ✨",
                    "Do you have a map? Because I just got lost in your eyes. 🗺️",
                    "Are you a parking ticket? Because you've got 'fine' written all over you. 🎫",
                    "If you were a vegetable, you'd be a cute-cumber. 🥒",
                    "Are you a campfire? Because you're hot and I want s'more. 🔥",
                    "Do you have a Band-Aid? Because I just scraped my knee falling for you. 🩹",
                    "Are you Wi-Fi? Because I'm feeling a connection. 📶",
                    "Is your name Google? Because you have everything I've been searching for. 🔍",
                    "Are you a time traveler? Because I can see you in my future. ⏰",
                    "Do you believe in love at first sight, or should I walk by again? 💕"
                ];
                
                const line = pickupLines[Math.floor(Math.random() * pickupLines.length)];
                await reply(`💘 *Pickup Line*\n\n${line}\n\n_GODFATHER XMD_`);
                break;
            }
            
            case 'compliment': {
                const compliments = [
                    "You're an awesome human being! 🌟",
                    "Your smile could light up a whole city! 😊",
                    "You make the world a better place! 🌍",
                    "You're more fun than bubble wrap! 🫧",
                    "You're like a ray of sunshine on a cloudy day! ☀️",
                    "You have the best laugh! 😄",
                    "You're someone's reason to smile! 😁",
                    "You could survive a zombie apocalypse! 🧟",
                    "Your creativity inspires others! 🎨",
                    "You're braver than you believe! 💪"
                ];
                
                const compliment = compliments[Math.floor(Math.random() * compliments.length)];
                await reply(`🌟 *Compliment*\n\n${compliment}\n\n_GODFATHER XMD_`);
                break;
            }
        }
    }
};