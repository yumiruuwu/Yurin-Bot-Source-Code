//const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

const status = {
    online: "Trực tuyến",
    idle: "Chế độ chờ/Nhàn rỗi",
    dnd: "Vui lòng không làm phiền",
    offline: "Ngoại tuyến/Ẩn",
};

const dvc = {
    web: "Trình duyệt",
    desktop: "Máy tính bàn/Laptop",
    mobile: "Điện thoại"
};

// const locale = {
//     'en-US': 'Tiếng Anh (Mỹ)',
//     'en-GB': 'Tiếng Anh (Anh)',
//     bg: 'Tiếng Bungari',
//     'zh-CN': 'Tiếng Trung Quốc',
//     'zh-TW': 'Tiếng Đài Loan',
//     hr: 'Tiếng Croatia',
//     cs: 'Tiếng Séc',
//     da: 'Tiếng Đan Mạch',
//     nl: 'Tiếng Hà Lan',
//     fi: 'Tiếng Phần Lan',
//     fr: 'Tiếng Pháp',
//     de: 'Tiếng Đức',
//     el: 'Tiếng Hy Lạp',
//     hi: 'Tiếng Hindi',
//     hu: 'Tiếng Hungary',
//     it: 'Tiếng Ý',
//     ja: 'Tiếng Nhật',
//     ko: 'Tiếng Hàn Quốc',
//     lt: 'Tiếng Litva',
//     no: 'Tiếng Na Uy',
//     pl: 'Tiếng Ba Lan',
//     'pt-BR': 'Tiếng Bồ Đào Nha',
//     ro: 'Tiếng Rumani',
//     ru: 'Tiếng Nga',
//     'es-ES': 'Tiếng Tây Ban Nha',
//     'sv-ES': 'Tiếng Thuỵ Điển',
//     th: 'Tiếng Thái',
//     tr: 'Tiếng Thổ Nhĩ Kỳ',
//     uk: 'Tiếng Ukraina',
//     vi: 'Tiếng Việt'
// };

module.exports = {
    name: 'whois',
    aliases: ['userinfo'],
    description: 'Xem thông tin thành viên',
    async execute (client, message, args, Discord) {
        var permissions = [];
        var acknowledgements = 'Member';

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

        if(member.permissions.has("ADMINISTRATOR")){
            permissions.push("Administrator");
        }

        if(member.permissions.has("MANAGE_GUILD")){
            permissions.push("Manage Guild")
        }

        if(member.permissions.has("KICK_MEMBERS")){
            permissions.push("Kick Members");
        }
        
        if(member.permissions.has("BAN_MEMBERS")){
            permissions.push("Ban Members");
        }
    
        if(member.permissions.has("MANAGE_MESSAGES")){
            permissions.push("Manage Messages");
        }
        
        if(member.permissions.has("MANAGE_CHANNELS")){
            permissions.push("Manage Channels");
        }
        
        if(member.permissions.has("MENTION_EVERYONE")){
            permissions.push("Mention Everyone");
        }
    
        if(member.permissions.has("MANAGE_NICKNAMES")){
            permissions.push("Manage Nicknames");
        }
    
        if(member.permissions.has("MANAGE_ROLES")){
            permissions.push("Manage Roles");
        }
    
        if(member.permissions.has("MANAGE_WEBHOOKS")){
            permissions.push("Manage Webhooks");
        }
    
        if(member.permissions.has("MANAGE_EMOJIS_AND_STICKERS")){
            permissions.push("Manage Emojis & Stickers");
        }
    
        if(permissions.length == 0){
            permissions.push("Không có");
        }

        if(member.permissions.has("MANAGE_GUILD" || "KICK_MEMBERS" || "BAN_MEMBERS" || "MODERATE_MEMBERS")) {
            acknowledgements = 'Staff'
        }

        if(member.permissions.has("ADMINISTRATOR")) {
            acknowledgements = 'Admin'
        }

        if(member.user.id == message.guild.ownerID){
            acknowledgements = 'Owner';
        }

        const activities = [];
        let customStatus = 'Thành viên không có Custom Status';
        for (const activity of member.presence.activities.values()) {
            switch (activity.type) {
                case 'PLAYING':
                    activities.push(`Đang chơi **${activity.name}**`);
                    break;
                case 'LISTENING':
                    if (member.user.bot) activities.push(`Listening to **${activity.name}**`);
                    else activities.push(`Đang nghe nhạc **${activity.details}** bởi **${activity.state}**`);
                    break;
                case 'WATCHING':
                    activities.push(`Đang xem **${activity.name}**`);
                    break;
                case 'STREAMING':
                    activities.push(`Đang phát trực tiếp **${activity.name}**`);
                    break;
                case 'CUSTOM':
                    customStatus = `${activity.state}`;
                    break;
            }
        }

        const devices = member.presence?.clientStatus || {};

        const entries = Object.entries(devices).map((value) => `${dvc[value[0]]}`).join(", ");

        const whoisembed = new MessageEmbed()
            //.setAuthor(`${member.user.tag}`, member.user.displayAvatarURL())
            .setAuthor({ name: `${member.user.tag}`, iconURL: member.user.displayAvatarURL() })
            .setColor(member.displayHexColor)
            //.setFooter(`ID: ${member.user.id}`)
            .setFooter({ text: `ID: ${member.user.id}` })
            .setThumbnail(member.user.displayAvatarURL({dynamic: true, size: 2048}))
            .setTimestamp()
            .addField("__Trạng thái__:",`${status[member.presence.status]}`, true)
            .addField('__Ngày tham gia server__:',`${moment(member.joinedAt).tz('Asia/Ho_Chi_Minh').format("[Ngày] D [tháng] M [năm] YYYY, HH:mm:ss")}`, true)
            .addField('__Tài khoản tạo lúc__:',`${moment(member.user.createdAt).tz('Asia/Ho_Chi_Minh').format("[Ngày] D [tháng] M [năm] YYYY, HH:mm:ss")}`, true)
            .addField('__Ngôn ngữ thường dùng (PC Client Only)__:', `Không hỗ trợ`)
            .addField(`__Vai trò [${member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => `\`${roles.name}\``).length}]:__`,`${member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => `<@&${roles.id }>`).join(" **|** ") || "Không có vai trò"}`, true)
            .addField("__Vị trí trong server__:", `${acknowledgements}`, true)
            .addField("__Quyền hạn__:", `${permissions.join(` | `)}`)
            .addField('__Nền tảng đang sử dụng:__', `${entries || 'Thành viên đang ngoại tuyến'}`);
        if (activities.length > 0) whoisembed.setDescription(`**__Hoạt động của thành viên:__** <@!${member.user.id}>\n${activities.join('\n')}`);
        if (customStatus) whoisembed.addFields({ name: '__Custom Status:__', value: `${customStatus}` });

        message.reply({ embeds: [whoisembed] });
    }
}