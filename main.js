//const Discord = require('discord.js');
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token, mongo_uri } = require('./config.json');
const prefix = require('./models/prefix');
// const { glob } = require("glob");
// const { promisify } = require("util");
const mongoose = require('mongoose');
//const { MessageEmbed, ContextMenuInteraction, MessageActionRow, MessageButton } = require("discord.js");
const { DiscordTogether } = require('discord-together');
const blacklist = require('./models/blacklist');
const DisTube = require('distube');
const { SoundCloudPlugin } = require("@distube/soundcloud");
// const globPromise = promisify(glob);

mongoose.connect(mongo_uri, { useNewUrlParser: true, useUnifiedTopology: true})

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] }, { partials: ["MESSAGE", "CHANNEL", "REACTION", "USER" ]});
//module.exports = client;
client.discordTogether = new DiscordTogether(client);
client.distube = new DisTube.default(client, {
	searchSongs: 0,
	searchCooldown: 30,
	emitNewSongOnly: true,
	leaveOnEmpty: true,
	emptyCooldown: 60,
	leaveOnFinish: true,
	leaveOnStop: true,
	updateYouTubeDL: false,
	plugins: [new SoundCloudPlugin()],
	// plugins: [new SoundCloudPlugin(), new SpotifyPlugin()],
});

for(const filez of fs.readdirSync('./distube_event/')) {
	if (filez.endsWith('.js')) {
		let fileName = filez.substring(0, filez.length - 3)
		let fileContents = require(`./distube_event/${filez}`)
		client.distube.on(fileName, fileContents.bind(null, client))
	}
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.commands = new Collection();
const slashcommandFiles = fs.readdirSync('./slashcommands').filter(file => file.endsWith('.js'));

for (const slash_file of slashcommandFiles) {
	const slash_command = require(`./slashcommands/${slash_file}`);
	client.commands.set(slash_command.data.name, slash_command);
}

//Slash Commands
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	//if (!interaction.isButton()) return;
	//if (!interaction.isAutocomplete()) return;
	const user = interaction.user;
    //const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id).catch(err => {}) || interaction.client.users.cache.get(user.id) || await interaction.client.users.fetch(user.id).catch(err => {})
	const member = interaction.client.users.cache.get(user.id)

	const slashcommand = client.commands.get(interaction.commandName);

	if (!slashcommand) return;
	blacklist.findOne({ id : member }, async(err, data) => {
		if (err) throw err;
		if (!data) {
			try {
				await slashcommand.execute(client, interaction);
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: '???? x???y ra l???i khi th???c thi l???nh slash!', ephemeral: true });
			}
		} else if (data) { //lgtm [js/trivial-conditional]
			interaction.reply({ content: 'Etou... C?? v??? nh?? b???n ???? b??? c???m s??? d???ng d???ch v??? c???a m??nh. N???u b???n ngh?? c?? s??? sai s??t g?? ??? ????y th?? h??y th??ng b??o cho ch??? bot ????? ???????c xem x??t l???i.'});
		}
	});
});

//client.contextmenucommands = new Collection();
const contextmenucommandFiles = fs.readdirSync('./contextmenu').filter(contextmenu_file => contextmenu_file.endsWith('.js'));

for (const contextmenu_file of contextmenucommandFiles) {
	const contextmenu_command = require(`./contextmenu/${contextmenu_file}`);
	client.commands.set(contextmenu_command.name, contextmenu_command);
}

//Context Menu
client.on('interactionCreate', async interaction => {
	if (!interaction.isContextMenu()) return;
	const user = interaction.user;
    //const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id).catch(err => {}) || interaction.client.users.cache.get(user.id) || await interaction.client.users.fetch(user.id).catch(err => {})
	const member = interaction.client.users.cache.get(user.id)
	//console.log(member)

	const contextmenu_command = client.commands.get(interaction.commandName);

	if (!contextmenu_command) return;
	blacklist.findOne({ id : member }, async(err, data) => {
		if (err) throw err;
		if (!data) {
			try {
				await contextmenu_command.execute(client, interaction);
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: '???? x???y ra l???i khi th???c thi l???nh slash!', ephemeral: true });
			}
		} else if (data) { //lgtm [js/trivial-conditional]
			interaction.reply({ content: 'Etou... C?? v??? nh?? b???n ???? b??? c???m s??? d???ng d???ch v??? c???a m??nh. N???u b???n ngh?? c?? s??? sai s??t g?? ??? ????y th?? h??y th??ng b??o cho ch??? bot ????? ???????c xem x??t l???i.'});
		}
	});
});

client.prefixcommands = new Collection();
require("./handler")(client); //Since Prefix Commands require async & await so handler for prefix commands is required

//Prefix Commands
client.on('messageCreate', async (message) => {
	//if(!message.content.startsWith(prefix) || message.author.bot) return;
	const prefixData = await prefix.findOne({
		GuildID: message.guild.id
	});

	if (prefixData) {
		const command_prefix = prefixData.Prefix;

		if (message.author.bot || !message.guild || !message.content.toLowerCase().startsWith(command_prefix)) return;
		const [cmd, ...args] = message.content.slice(command_prefix.length).trim().split(" ");
	
		const member = message.author.id;
		let idmember = `<@${member}>`;
		//console.log(idmember);		
		const commmand = client.prefixcommands.get(cmd.toLowerCase()) || client.prefixcommands.find(c => c.aliases?.includes(cmd.toLowerCase()));
		if (!commmand) return;
		blacklist.findOne({ id : idmember }, async(err, data) => {
			if (err) throw err;
			if (!data) {
				try {
					await commmand.execute(client, message, args);
				} catch (error) {
					console.error(error);
					await message.reply('???? x???y ra l???i khi th???c thi l???nh!');
				}		
			} else if (data) { //lgtm [js/trivial-conditional]
				message.reply(`Etou... C?? v??? nh?? b???n ???? b??? c???m s??? d???ng d???ch v??? c???a m??nh. N???u b???n ngh?? c?? s??? sai s??t g?? ??? ????y th?? h??y th??ng b??o cho ch??? bot ????? ???????c xem x??t l???i.`);
			}
		})
	} else if (!prefixData) {
		const command_prefix = "_";

		let newData = new prefix({
			Prefix: command_prefix,
			GuildID: message.guild.id
		})
		newData.save();

		if (message.author.bot || !message.guild || !message.content.toLowerCase().startsWith(command_prefix)) return;
		const [cmd, ...args] = message.content.slice(command_prefix.length).trim().split(" ");
	
		const member = message.author.id;
		let idmember = `<@${member}>`;
		//console.log(idmember);		
		const commmand = client.prefixcommands.get(cmd.toLowerCase()) || client.prefixcommands.find(c => c.aliases?.includes(cmd.toLowerCase()));
		if (!commmand) return;
		blacklist.findOne({ id : idmember }, async(err, data) => {
			if (err) throw err;
			if (!data) {
				try {
					await commmand.execute(client, message, args);
				} catch (error) {
					console.error(error);
					await message.reply('???? x???y ra l???i khi th???c thi l???nh!');
				}		
			} else if (data) { //lgtm [js/trivial-conditional]
				message.reply(`Etou... C?? v??? nh?? b???n ???? b??? c???m s??? d???ng d???ch v??? c???a m??nh. N???u b???n ngh?? c?? s??? sai s??t g?? ??? ????y th?? h??y th??ng b??o cho ch??? bot ????? ???????c xem x??t l???i.`);
			}
		})
	}
});

client.login(token);