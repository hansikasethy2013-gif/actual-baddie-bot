const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent 
  ],
  partials: [Partials.Channel]
});

// --- GLOBAL SYSTEMS ---
let baddieMood = 'fabulous'; 
const userReputation = {};
const userInventory = {}; 
const userBio = {}; 
const lastDaily = {}; 
const userXP = {}; 
const userLevel = {}; 
const lastWork = {}; 
const userPets = {}; 
const userPartner = {}; 
const userJob = {}; 
const petLevel = {}; 
const lastRob = {}; // NEW: Robbery cooldown

const teaVault = [
  "I heard someone in this server is wearing fake designer... but I won't say who. 🤐",
  "My bank account called, it said I'm too iconic to be working today. 🍷💯",
  "Life is short, make every outfit count. Some of you clearly missed the memo. 🙄",
  "I don't follow trends, I am the trend. 💅🏻✨",
  "I'm not rude, I'm just honest. And you look basic. 💅🏻"
];

const shopItems = {
  "sunglasses": { cost: 50, description: "Look cool while ignoring haters." },
  "gucci-bag": { cost: 150, description: "Carry your ego in style." },
  "pet-food": { cost: 10, description: "Keep your pet alive." },
  "wedding-ring": { cost: 2000, description: "To secure the bag... I mean, love. 💍" }
};

client.on('ready', () => {
  console.log(`${client.user.tag} is officially in the building! 💅✨`);
  setInterval(() => {
    const moods = ['fabulous', 'sassy', 'expensive', 'unbothered', 'judgemental'];
    baddieMood = moods[Math.floor(Math.random() * moods.length)];
  }, 600000);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();
  const userId = message.author.id;

  // --- INITIALIZE DATA ---
  if (!userReputation[userId]) userReputation[userId] = 0;
  if (!userInventory[userId]) userInventory[userId] = [];
  if (!userBio[userId]) userBio[userId] = "Just a basic human. 🙄";
  if (!userXP[userId]) userXP[userId] = 0;
  if (!userLevel[userId]) userLevel[userId] = 1;
  if (!userJob[userId]) userJob[userId] = "Unemployed 🗑️";
  if (!petLevel[userId]) petLevel[userId] = 1;

  // --- XP SYSTEM ---
  userXP[userId] += 5;
  if (userXP[userId] >= userLevel[userId] * 100) {
    userLevel[userId]++;
    userXP[userId] = 0;
    message.channel.send(`🍷 **${message.author.username}** leveled up to **Level ${userLevel[userId]}**! 💅🏻✨`);
  }

  // --- COMMAND HANDLING (The "Return" after each prevents double responses) ---

  if (content.startsWith('$top')) {
    const sorted = Object.entries(userReputation).sort(([, a], [, b]) => b - a).slice(0, 5);
    let leaderboard = "🏆 **BADDIE HALL OF FAME** 🏆\n\n";
    for (let i = 0; i < sorted.length; i++) {
      try {
        const user = await client.users.fetch(sorted[i][0]);
        leaderboard += `${i+1}. **${user.username}** — ${sorted[i][1]} Rep\n`;
      } catch (e) { leaderboard += `${i+1}. **Unknown** — ${sorted[i][1]} Rep\n`; }
    }
    return message.reply(leaderboard);
  }

  else if (content.startsWith('$daily')) {
    const now = Date.now();
    if (lastDaily[userId] && (now - lastDaily[userId]) < 86400000) return message.reply("Wait for your allowance, local. 🙄");
    lastDaily[userId] = now;
    userReputation[userId] += 10;
    return message.reply('Daily 10 Rep added. 🛍️✨');
  }

  else if (content.startsWith('$work')) {
    const now = Date.now();
    if (lastWork[userId] && (now - lastWork[userId]) < 3600000) return message.reply("Take a break, you're sweating. 🙄");
    let earnings = Math.floor(Math.random() * 20) + 5;
    if (userJob[userId] === "CEO of Sass 👑") earnings += 20;
    userReputation[userId] += earnings;
    lastWork[userId] = now;
    return message.reply(`You earned ${earnings} Rep! 💼✨`);
  }

  else if (content.startsWith('$rob')) { // NEW: Robbery
    const target = message.mentions.users.first();
    if (!target || target.id === userId) return message.reply("Mention someone to rob, you amateur. 💅");
    
    const now = Date.now();
    if (lastRob[userId] && (now - lastRob[userId]) < 7200000) return message.reply("Too much crime! Wait 2 hours. 👮‍♀️");
    
    if ((userReputation[target.id] || 0) < 10) return message.reply("They're too broke to even rob. 😶");

    lastRob[userId] = now;
    if (Math.random() > 0.5) {
        const stolen = Math.floor(Math.random() * 15) + 1;
        userReputation[userId] += stolen;
        userReputation[target.id] -= stolen;
        return message.reply(`You snatched ${stolen} Rep from ${target.username}! Savage. 😈✨`);
    } else {
        userReputation[userId] -= 5;
        return message.reply(`You got caught and lost 5 Rep. Embarrassing for you. 👽🥀`);
    }
  }

  else if (content.startsWith('$profile')) {
    const rep = userReputation[userId];
    const rank = rep > 100 ? "Main Character 👑" : rep > 50 ? "Iconic Legend ✨" : "Broke & Basic 🥀";
    const profileEmbed = new EmbedBuilder()
      .setColor(0xFF00FF)
      .setTitle(`💖 ${message.author.username}'s Profile`)
      .addFields(
        { name: 'Reputation', value: `${rep}`, inline: true },
        { name: 'Rank', value: rank, inline: true },
        { name: 'Job', value: userJob[userId], inline: true },
        { name: 'Partner', value: userPartner[userId] ? `<@${userPartner[userId]}> 💖` : "Single 🍷", inline: true },
        { name: 'Pet', value: userPets[userId] ? `${userPets[userId]} (Lv. ${petLevel[userId]})` : "None", inline: true },
        { name: 'Bio', value: userBio[userId] }
      );
    return message.reply({ embeds: [profileEmbed] });
  }

  else if (content.startsWith('$setbio ')) { // NEW: Set Bio
    const newBio = message.content.substring(8);
    if (newBio.length > 60) return message.reply("Too long. Keep it under 60 chars, bestie. 💯");
    userBio[userId] = newBio;
    return message.reply("Bio updated! ✨");
  }

  else if (content.startsWith('$inv')) { // NEW: Inventory check
    const items = userInventory[userId].length > 0 ? userInventory[userId].join(", ") : "Empty. Go shopping! 🛍️";
    return message.reply(`**Your Closet:** ${items}`);
  }

  else if (content.startsWith('$shop')) {
    let shopMsg = "🛍️ **BADDIE SHOP** 🛍️\n\n";
    for (let item in shopItems) shopMsg += `**${item}** (${shopItems[item].cost} Rep) - ${shopItems[item].description}\n`;
    return message.reply(shopMsg);
  }

  else if (content.startsWith('$buy ')) {
    const itemName = content.split(' ')[1];
    const item = shopItems[itemName];
    if (!item) return message.reply("We don't sell that trash here. 🙄");
    if (userReputation[userId] < item.cost) return message.reply("You're too broke. 👽🥀");
    userReputation[userId] -= item.cost;
    userInventory[userId].push(itemName);
    return message.reply(`Bought **${itemName}**! 💎`);
  }

  else if (content.startsWith('$divorce')) { // NEW: Divorce
    if (!userPartner[userId]) return message.reply("You're already single. 👽💯");
    const ex = userPartner[userId];
    userPartner[userId] = null;
    userPartner[ex] = null;
    return message.reply(`You are now divorced. Thank u, next. 💔`);
  }

  else if (content.startsWith('$adopt ')) {
    if (userPets[userId]) return message.reply("One pet is enough drama. 🐶");
    userPets[userId] = message.content.substring(7);
    return message.reply(`Adopted **${userPets[userId]}**! 🐾`);
  }

  else if (content.startsWith('$marry')) {
    const target = message.mentions.users.first();
    if (!target || target.id === userId) return message.reply("Mention someone else to marry! 💍");
    if (!userInventory[userId].includes('wedding-ring')) return message.reply("Buy a ring first! 💍");
    client.proposal = { proposer: userId, target: target.id };
    return message.channel.send(`${target}, accept with \`$accept\`? 💗`);
  }

  else if (content.startsWith('$accept')) {
    if (!client.proposal || client.proposal.target !== userId) return message.reply("No one wants you right now. 🙄");
    userPartner[client.proposal.proposer] = userId;
    userPartner[userId] = client.proposal.proposer;
    userInventory[client.proposal.proposer].splice(userInventory[client.proposal.proposer].indexOf('wedding-ring'), 1);
    client.proposal = null;
    return message.channel.send("Congrats! You're married! 💍💖");
  }

  else if (content.startsWith('$apply')) {
    userJob[userId] = "CEO of Sass 👑";
    return message.reply("You're the CEO now. 💼✨");
  }

  else if (content.startsWith('$glowup')) {
    if (Math.random() > 0.7) { userReputation[userId] += 10; return message.reply('Major glow-up! 💎✨'); }
    else { userReputation[userId] -= 2; return message.reply('Failed. Embarrassing. 🤢'); }
  }

  else if (content.startsWith('$tea')) return message.reply(teaVault[Math.floor(Math.random() * teaVault.length)]);
  else if (content.startsWith('$checkrep')) return message.reply(`Reputation: ${userReputation[userId]} 💅`);

  // --- PASSIVE REACTIONS (ONLY RUNS IF NO COMMANDS ABOVE MATCH) ---
  else if (content.includes('baddie')) {
    if (content.includes('slay') || content.includes('love')) {
        userReputation[userId] += 2;
        return message.reply('Obviously. 💅🏻');
    }
    return message.react('👑');
  }
});

client.login(process.env.DISCORD_TOKEN);
