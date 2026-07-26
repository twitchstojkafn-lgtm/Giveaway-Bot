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

const PARTICIPANTS_FILE = "./participants.json";
const GIVEAWAY_FILE = "./giveaway.json";

let participants = JSON.parse(fs.readFileSync(PARTICIPANTS_FILE));
let giveaway = JSON.parse(fs.readFileSync(GIVEAWAY_FILE));


client.once("clientReady", () => {
    console.log(`${client.user.tag} je online!`);
});


// pravi kod tipa FN8K4P
function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "";

    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return "FN" + code.substring(2);
}


client.on("messageCreate", async message => {

    if (message.author.bot) return;

    const args = message.content.split(" ");


    // ADMIN pravi novi giveaway
if (args[0] === "!newgiveaway") {

        const code = generateCode();

        giveaway.code = code;
        giveaway.active = true;


        // Reset učesnika za novi giveaway
        participants = [];

        fs.writeFileSync(
            PARTICIPANTS_FILE,
            JSON.stringify(participants, null, 2)
        );


        fs.writeFileSync(
            GIVEAWAY_FILE,
            JSON.stringify(giveaway, null, 2)
        );


        return message.reply(
            `🎁 Novi giveaway pokrenut!\n\n🔑 Kod za Fortnite mapu:\n\`${code}\`\n\n📌 Postavi ovaj kod u mapu.`
        );
    }



    // IGRAČI UNOSE KOD
    if (args[0] === "!code") {


        if (!args[1]) {
            return message.reply("❌ Upiši kod.");
        }


        if (!giveaway.active) {
            return message.reply("❌ Trenutno nema aktivnog giveaway-a.");
        }


        if (participants.includes(message.author.id)) {
            return message.reply("⚠️ Već si učestvovao!");
        }



        if (args[1] === giveaway.code) {


            const role = message.guild.roles.cache.find(
                r => r.name === "Verified"
            );


            if (!role) {
                return message.reply("❌ Nema Verified role.");
            }


            await message.member.roles.add(role);


            participants.push(message.author.id);


            fs.writeFileSync(
                PARTICIPANTS_FILE,
                JSON.stringify(participants, null, 2)
            );


            message.reply("🎁 Prijavljen si za giveaway!");


        } else {

            message.reply("❌ Pogrešan kod.");

        }
    }

});


client.login(TOKEN);