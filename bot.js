'use strict';
const Discord = require('discord.js');
const parser = require('discord-command-parser')
const { Krunker: Api, OrderBy, UserNotFoundError } = require("@fasetto/krunker.io")

const path = require('path')

const config = require(path.join(__dirname, 'config.json'));

const client = new Discord.Client();
const Krunker = new Api();

const getKrunkerProfile = async name => {
    try {
        const user = await Krunker.GetProfile(name);
        return user;
    } catch (e) {
        if (e instanceof UserNotFoundError) {
            throw new Error('User not found');
        } else {
            console.log(e);
            throw new Error('Unknown internal error');
        };
    };
};

client.on('ready', () => {
    console.log('bot is ready');
    const word = config.playing
    setInterval(() => {
        client.user.setActivity(word[Math.floor(Math.random() * word.length)])
    }, 30000);
});

client.on('message', message => {
    const parsed = parser.parse(message, config.prefix, config.parser);
    if (!parsed.success) return;
    if (parsed.command === 'stats' || parsed.command === 's') {
        getKrunkerProfile(parsed.arguments[0]).then(data => {
            const embed = new Discord.RichEmbed()
                .setColor(1752220)
                .setURL(`https://krunker.io/social.html?p=profile&q=${data.name}`)
                .setDescription(`Level ${data.level} · ${data.funds.toLocaleString('en-GB')} KR · ${data.followers.toLocaleString('en-GB')} Followers`)
                .setTitle(`Statistics for **${data.name} [${data.clan}]** ${(data.featured === 'Yes') ? `:ballot_box_with_check:` : ''} ${(data.hacker) ? 'HACKER' : ''}`)
                .addField(`${data.kdr} KDR`, `${data.kills.toLocaleString('en-GB')} kills · ${data.deaths.toLocaleString('en-GB')} deaths`, true)
                .addBlankField(true)
                .addField(`${data.wl} W/L`, `${data.wins.toLocaleString('en-GB')} wins · ${data.loses.toLocaleString('en-GB')} loses`, true)
                .addField(`${data.playTime.toUpperCase()} Play Time`, `${data.totalGamesPlayed.toLocaleString('en-GB')} Games Played`, true)
                .addBlankField(true)
                .addField(`${data.spk.toLocaleString('en-GB')} SPK`, `${data.score.toLocaleString('en-GB')} Score`, true);

            message.channel.send({ embed: embed });

        }).catch(e => {
            const embed = new Discord.RichEmbed()
                .setColor(15158332)
                .addField('rip :(', 'User unknown or internal error');

            message.channel.send({ embed: embed });
        });
    };
});

client.login(config.token);