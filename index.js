const { startBot } = require('./connection');
const chalk = require('chalk');
const fs = require('fs');
const config = require('./config');

console.log(chalk.cyan.bold(`
╔══════════════════════════════════════╗
║                                      ║
║     ██████╗  ██████╗ ██████╗         ║
║    ██╔════╝ ██╔═══██╗██╔══██╗        ║
║    ██║  ███╗██║   ██║██║  ██║        ║
║    ██║   ██║██║   ██║██║  ██║        ║
║    ╚██████╔╝╚██████╔╝██████╔╝        ║
║     ╚═════╝  ╚═════╝ ╚═════╝         ║
║                                      ║
║    ███████╗ █████╗ ████████╗         ║
║    ██╔════╝██╔══██╗╚══██╔══╝         ║
║    █████╗  ███████║   ██║            ║
║    ██╔══╝  ██╔══██║   ██║            ║
║    ██║     ██║  ██║   ██║            ║
║    ╚═╝     ╚═╝  ╚═╝   ╚═╝            ║
║                                      ║
║    ██╗  ██╗███╗   ███╗██████╗        ║
║    ╚██╗██╔╝████╗ ████║██╔══██╗       ║
║     ╚███╔╝ ██╔████╔██║██║  ██║       ║
║     ██╔██╗ ██║╚██╔╝██║██║  ██║       ║
║    ██╔╝ ██╗██║ ╚═╝ ██║██████╔╝       ║
║    ╚═╝  ╚═╝╚═╝     ╚═╝╚═════╝        ║
║                                      ║
║   GODFATHER XMD - WhatsApp Bot       ║
║   Created by: Soham                  ║
║   Version: 3.0.0                     ║
║                                      ║
╚══════════════════════════════════════╝
`));

// Create necessary directories
const dirs = ['auth', 'temp', 'lib', 'plugins', 'handlers'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true 