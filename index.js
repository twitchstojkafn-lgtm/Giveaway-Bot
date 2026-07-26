const { 
    Client, 
    GatewayIntentBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle 
} = require("discord.js");

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



// pravi kod FNXXXX
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



    // NOVI GIVEAWAY
    if (args[0] === "!newgiveaway") {


        const code = generateCode();


        giveaway.code = code;
        giveaway.active = true;



        participants = [];


        fs.writeFileSync(
            PARTICIPANTS_FILE,
            JSON.stringify(participants, null, 2)
        );


        fs.writeFileSync(
            GIVEAWAY_FILE,
            JSON.stringify(giveaway, null, 2)
        );



        const button = new ButtonBuilder()
            .setCustomId("join_giveaway")
            .setLabel("🎟️ UČESTVUJ")
            .setStyle(ButtonStyle.Success);



        const row = new ActionRowBuilder()
            .addComponents(button);



        return message.reply({

            content:
            `🎁 **NOVI FORTNITE GIVEAWAY!**\n\nPronađi tajni kod na Fortnite mapi i klikni dugme ispod.\n\n📌 Kod je sakriven u mapi!`,

            components: [row]

        });

    }


// INFORMACIJE O GIVEAWAYU
if (args[0] === "!giveawayinfo") {

    return message.reply(
        `🎁 **Giveaway Info**\n\n` +
        `🟢 Status: ${giveaway.active ? "Aktivan" : "Nije aktivan"}\n` +
        `👥 Učesnici: ${participants.length}\n` +
        `🔑 Kod: Sakriven`
    );

}



// IZVLAČENJE POBEDNIKA
if (args[0] === "!winner") {


    if (participants.length === 0) {

        return message.reply(
            "❌ Nema učesnika."
        );

    }


    const winnerId = participants[
        Math.floor(Math.random() * participants.length)
    ];


    return message.reply(
        `🏆 **Pobednik giveaway-a:**\n\n<@${winnerId}>\n\n🎁 Čestitamo!`
    );

}


    // STARI SISTEM !code (ostavljamo ako želiš)
    if (args[0] === "!code") {


        if (!args[1]) {
            return message.reply("❌ Upiši kod.");
        }


        if (!giveaway.active) {
            return message.reply("❌ Nema aktivnog giveaway-a.");
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



            return message.reply("🎁 Prijavljen si za giveaway!");

        }


        return message.reply("❌ Pogrešan kod.");

    }

});







// DUGME + MODAL

client.on("interactionCreate", async interaction => {



    // KLIK NA DUGME

    if (interaction.isButton()) {


        if (interaction.customId === "join_giveaway") {



            const modal = new ModalBuilder()

                .setCustomId("code_modal")

                .setTitle("Unesi Fortnite kod");




            const input = new TextInputBuilder()

                .setCustomId("giveaway_code")

                .setLabel("Kod sa Fortnite mape")

                .setStyle(TextInputStyle.Short)

                .setPlaceholder("FN8K4P");




            const row = new ActionRowBuilder()

                .addComponents(input);



            modal.addComponents(row);



            return interaction.showModal(modal);

        }

    }





    // SLANJE KODA

    if (interaction.isModalSubmit()) {



        if (interaction.customId === "code_modal") {



            const code = interaction.fields.getTextInputValue(
                "giveaway_code"
            );




            if (!giveaway.active) {

                return interaction.reply({

                    content:"❌ Trenutno nema giveaway-a.",

                    ephemeral:true

                });

            }





            if (participants.includes(interaction.user.id)) {

                return interaction.reply({

                    content:"⚠️ Već si učestvovao!",

                    ephemeral:true

                });

            }





            if (code !== giveaway.code) {


                return interaction.reply({

                    content:"❌ Pogrešan kod.",

                    ephemeral:true

                });

            }






            const role = interaction.guild.roles.cache.find(

                r => r.name === "Verified"

            );





            if (!role) {


                return interaction.reply({

                    content:"❌ Nema Verified role.",

                    ephemeral:true

                });

            }





            await interaction.member.roles.add(role);




            participants.push(interaction.user.id);




            fs.writeFileSync(

                PARTICIPANTS_FILE,

                JSON.stringify(participants, null, 2)

            );





            return interaction.reply({

                content:"🎁 Uspešno si prijavljen za giveaway!",

                ephemeral:true

            });


        }

    }



});





client.login(TOKEN);