const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const TOKEN = process.env.TOKEN;

const SECRET_CODE = "FIGHT2026";

const FILE = "./participants.json";

let participants = JSON.parse(fs.readFileSync(FILE));

client.once("clientReady", () => {
    console.log(`${client.user.tag} je online!`);
});

client.on("messageCreate", async message => {

    if (message.author.bot) return;

    const args = message.content.split(" ");

    if (args[0] === "!code") {

        if (!args[1]) {
            return message.reply("❌ Upiši kod.");
        }

        if (participants.includes(message.author.id)) {
            return message.reply("⚠️ Već si učestvovao!");
        }

        if (args[1] === SECRET_CODE) {

            const role = message.guild.roles.cache.find(
                r => r.name === "Verified"
            );

            if (!role) {
                return message.reply("❌ Nemaš verified role.");
            }

            await message.member.roles.add(role);

            participants.push(message.author.id);

            fs.writeFileSync(
                FILE,
                JSON.stringify(participants, null, 2)
            );

            message.reply("🎁 Prijavljen si za giveaway!");

        } else {

            message.reply("❌ Pogrešan kod.");

        }
    }
});

client.login(TOKEN);