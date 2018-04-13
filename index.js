const botconfig = require("./botconfig.json");
const Discord = require("discord.js");

const client = new Discord.Client({
    disableEveryone: true
})

const Creator = "Mio / Μισάνθρωπος.";
const Founded = "09/03/2018";
const prefix = botconfig.prefix;
const fs = require("fs");
const db = require("quick.db");

// Collections
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

// Command Handler
fs.readdir('./commands/', (err, files) => {
    if (err)
        console.error(err);
    let jsfiles = files.filter(f => f.split('.').pop() === 'js');
    if (jsfiles.length <= 0) {
        console.log('No commands to load!');
        return;
    }
    console.log(`[Commands]\tLoaded a total amount ${files.length} Commands`);
    jsfiles.forEach(f => {
        let props = require(`./commands/${ f }`);
        client.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
});

// Event Handler
fs.readdir('./events/', async (err, files) => {
    if (err) return console.error(err);
    const jsfiles = files.filter(f => f.split('.').pop() === 'js');
    if (jsfiles.length <= 0) {
        return console.log('[Events]\tNo events could be loaded');
    } else {
        console.log(`[Events]\tLoaded a total amount ${jsfiles.length} events`);
    }
    files.forEach(file => {
        let eventFunction = require(`./events/${file}`);
        let eventName = file.split('.')[0];
        client.on(eventName, (...args) => eventFunction.run(client, ...args));
    });
});

client.reload = function (command) {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./commands/${ command }`)];
            let cmd = require(`./commands/${ command }`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command)
                    client.aliases.delete(alias);
            });
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

process.on('unhandledRejection', err => {
  console.error('Uncaught Promise Error: ', err);
});

client.login(botconfig.token);
