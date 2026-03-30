],
  partials: [Partials.Channel]
});

// --- GLOBAL SYSTEMS ---
let baddieMood = 'fabulous'; 
const userReputation = {};
const userBank = {}; 
const userInventory = {}; 
const userBio = {}; 
const lastDaily = {}; 
const userXP = {}; 
const userLevel = {}; 
const lastWork = {}; 
const userPets = {}; 
const petLevel = {}; 
const userPartner = {}; 
const userJob = {}; 
const lastRob = {}; 

const teaVault = [
  "I heard someone in this server is wearing fake designer... but I won't say who. 🤐",
  "My bank account called, it said I'm too iconic to be working today. 🍷✨",
  "Life is short, make every outfit count. Some of you clearly missed the memo. 💀🌹",
  "I don't follow trends, I am the trend. 💅🏻🔥",
  "I'm not rude, I'm just honest. And you look basic. 🌚✨"
];

const shopItems = {
  "sunglasses": { cost: 50, description: "Look cool while ignoring haters. 👀" },
  "gucci-bag": { cost: 150, description: "Carry your ego in style. 🔥" },
  "pet-food": { cost: 20, description: "Level up your pet. 🖇️" },
  "energy-drink": { cost: 100, description: "Reset your work cooldown. ⚡" },
  "wedding-ring": { cost: 2000, description: "To secure the bag... I mean, love. 💍💖" }
};

// FIXED: Changed 'ready' to 'clientReady' to stop the crash/warning 🚨
client.once('clientReady', (c) => {
  console.log(`${c.user.tag} is officially in the building! 💅🏻✨`);
  setInterval(() => {
    const moods = ['fabulous', 'sassy', 'expensive', 'unbothered', 'judgemental'];
    baddieMood = moods[Math.floor(Math.random() * moods.length)];
  }, 600000);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const content = message.content.toLowerCase();
  const userId = message.author.id;

  // --- INITIALIZE DATA (Safety First! 🖇️) ---
  if (!userReputation[userId]) userReputation[userId] = 0;
  if (!userBank[userId]) userBank[userId] = 0;
  if (!userInventory[userId]) userInventory[userId] = [];
  if (!userBio[userId]) userBio[userId] = "Just a basic human. 🌚";
  if (!userXP[userId]) userXP[userId] = 0;
  if (!userLevel[userId]) userLevel[userId] = 1;
  if (!userJob[userId]) userJob[userId] = "Unemployed 💀";
  if (!petLevel[userId]) petLevel[userId] = 0;

  // --- XP SYSTEM ---
  userXP[userId] += 5;
  if (userXP[userId] >= userLevel[userId] * 100) {
    userLevel[userId]++;
    userXP[userId] = 0;
    message.channel.send(`✨ **${message.author.username}** leveled up to **Level ${userLevel[userId]}**! 🍷💖`);
  }

  // --- COMMAND HANDLING ---

  if (content.startsWith('$top')) {
    const sorted = Object.entries(userReputation).sort(([, a], [, b]) => b - a).slice(0, 5);
    let leaderboard = "🏆 **BADDIE HALL OF FAME** 🏆\n\n";
    for (let i = 0; i < sorted.length; i++) {
      try {
        const user = await client.users.fetch(sorted[i][0]);
        leaderboard += `${i+1}. **${user.username}** — ${sorted[i][1]} Rep 💅🏻\n`;
      } catch (e) { leaderboard += `${i+1}. **Unknown** — ${sorted[i][1]} Rep\n`; }
    }
    return message.reply(leaderboard);
  }

  else if (content.startsWith('$daily')) {
    const now = Date.now();
    if (lastDaily[userId] && (now - lastDaily[userId]) < 86400000) return message.reply("Wait for your allowance, local. 🌚💔");
    lastDaily[userId] = now;
    userReputation[userId] += 20;
    return message.reply('Daily 20 Rep added. 🛍️✨');
  }

  else if (content.startsWith('$work')) {
    const now = Date.now();
    if (lastWork[userId] && (now - lastWork[userId]) < 3600000) return message.reply("Take a break, you're sweating. 💀🔥");
    let earnings = Math.floor(Math.random() * 30) + 10;
    if (userJob[userId] === "CEO of Sass 👑") earnings += 25;
    userReputation[userId] += earnings;
    lastWork[userId] = now;
    return message.reply(`You earned ${earnings} Rep! 💼🍷`);
  }

  else if (content.startsWith('$rob')) {
    const target = message.mentions.users.first();
    if (!target || target.id === userId) return message.reply("Mention someone to rob, you amateur. 💅🏻🚨");
    const now = Date.now();
    if (lastRob[userId] && (now - lastRob[userId]) < 7200000) return message.reply("The police are watching! Wait 2 hours. 🚨💀");
    if ((userReputation[target.id] || 0) < 20) return message.reply("They're too broke to even rob. 👽💔");

    lastRob[userId] = now;
    if (Math.random() > 0.5) {
        const stolen = Math.floor(Math.random() * 20) + 5;
        userReputation[userId] += stolen;
        userReputation[target.id] -= stolen;
        return message.reply(`You snatched ${stolen} Rep from ${target.username}! Savage. 😝🔥`);
    } else {
        userReputation[userId] -= 10;
        return message.reply(`You got caught and lost 10 Rep. Embarrassing for you. 👽🚨`);
    }
  }

  else if (content.startsWith('$dep ')) {
    const amount = parseInt(content.split(' ')[1]);
    if (isNaN(amount) || amount <= 0 || amount > userReputation[userId]) return message.reply("Enter a valid amount to hide! 🖇️👀");
    userReputation[userId] -= amount;
    userBank[userId] += amount;
    return message.reply(`Deposited ${amount} Rep into your vault. Safe from robbers! 💖🔒`);
  }

  else if (content.startsWith('$profile')) {
    const rep = userReputation[userId];
    const rank = rep > 200 ? "Main Character 👑" : rep > 100 ? "Iconic Legend ✨" : "Broke & Basic 💀";
    const profileEmbed = new EmbedBuilder()
      .setColor(0xFF00FF)
      .setTitle(`💖 ${message.author.username}'s Profile`)
      .addFields(
        { name: 'Wallet', value: `${rep} 💅🏻`, inline: true },
        { name: 'Bank', value: `${userBank[userId]} 🍷`, inline: true },
        { name: 'Rank', value: rank, inline: true },
        { name: 'Partner', value: userPartner[userId] ? `<@${userPartner[userId]}> 🌹` : "Single 💔", inline: true },
        { name: 'Pet', value: userPets[userId] ? `${userPets[userId]} (Lv. ${petLevel[userId]}) 🐾` : "None", inline: true },
        { name: 'Bio', value: userBio[userId] }
      );
    return message.reply({ embeds: [profileEmbed] });
  }

  else if (content.startsWith('$give ')) {
    const target = message.mentions.users.first();
    const amount = parseInt(content.split(' ')[2]);
    if (!target || isNaN(amount) || amount <= 0 || amount > userReputation[userId]) return message.reply("Check your wallet and try again, bestie. 🖇️🌚");
    userReputation[userId] -= amount;
    userReputation[target.id] = (userReputation[target.id] || 0) + amount;
    return message.reply(`You gave ${amount} Rep to ${target.username}. Generous queen! 💖🌹`);
  }

  else if (content.startsWith('$shop')) {
    let shopMsg = "🛍️ **BADDIE SHOP** 🛍️\n\n";
    for (let item in shopItems) shopMsg += `**${item}** (${shopItems[item].cost} Rep) - ${shopItems[item].description}\n`;
    return message.reply(shopMsg);
  }

  else if (content.startsWith('$buy ')) {
    const itemName = content.split(' ')[1];
    const item = shopItems[itemName];
    if (!item) return message.reply("We don't sell that trash here. 🌚💀");
    if (userReputation[userId] < item.cost) return message.reply("You're too broke. 👽💔");
    
    if (itemName === "pet-food") {
        if (!userPets[userId]) return message.reply("Buy a pet before you buy the food, genius. 💀");
        petLevel[userId]++;
        userReputation[userId] -= item.cost;
        return message.reply(`Your pet is now **Level ${petLevel[userId]}**! 🐾✨`);
    }

    userReputation[userId] -= item.cost;
    userInventory[userId].push(itemName);
    return message.reply(`Bought **${itemName}**! 💎🔥`);
  }

  else if (content.startsWith('$adopt ')) {
    if (userPets[userId]) return message.reply("One pet is enough drama. 🐾💔");
    userPets[userId] = message.content.substring(7);
    petLevel[userId] = 1;
    return message.reply(`Adopted **${userPets[userId]}**! 🖇️💖`);
  }

  else if (content.startsWith('$marry')) {
    const target = message.mentions.users.first();
    if (!target || target.id === userId) return message.reply("Mention someone else to marry! 💍👀");
    if (!userInventory[userId].includes('wedding-ring')) return message.reply("Buy a ring first! 💍🔥");
    client.proposal = { proposer: userId, target: target.id };
    return message.channel.send(`${target}, accept with \`$accept\`? 🌹💖`);
  }

  else if (content.startsWith('$accept')) {
    if (!client.proposal || client.proposal.target !== userId) return message.reply("No one wants you right now. 🌚💔");
    userPartner[client.proposal.proposer] = userId;
    userPartner[userId] = client.proposal.proposer;
    userInventory[client.proposal.proposer].splice(userInventory[client.proposal.proposer].indexOf('wedding-ring'), 1);
    client.proposal = null;
    return message.channel.send("Congrats! You're married! 💍🌹✨");
  }

  else if (content.startsWith('$divorce')) {
    if (!userPartner[userId]) return message.reply("You're already single. 👽🔥");
    const ex = userPartner[userId];
    userPartner[userId] = null;
    userPartner[ex] = null;
    return message.reply(`You are now divorced. Thank u, next. 💔💀`);
  }

  else if (content.startsWith('$setbio ')) {
    const newBio = message.content.substring(8);
    if (newBio.length > 60) return message.reply("Too long. Keep it under 60 chars. 🖇️🌚");
    userBio[userId] = newBio;
    return message.reply("Bio updated! ✨🔥");
  }

  else if (content.startsWith('$tea')) return message.reply(teaVault[Math.floor(Math.random() * teaVault.length)]);
  else if (content.startsWith('$checkrep')) return message.reply(`Reputation: ${userReputation[userId]} 💅🏻🍷`);
  else if (content.startsWith('$apply')) {
    userJob[userId] = "CEO of Sass 👑";
    return message.reply("You're the CEO now. 💼🔥✨");
  }

  // --- PASSIVE REACTIONS ---
  else if (content.includes('baddie')) {
    if (content.includes('slay') || content.includes('love')) {
        userReputation[userId] += 2;
        return message.reply('Obviously. 💅🏻🔥');
    }
    return message.react('👑');
  }
});

client.login(process.env.DISCORD_TOKEN);
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const client = new Client({ 
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

// --- DATABASE SYSTEMS ---
const userReputation = {}; 
const userBank = {}; 
const userInventory = {}; 
const lastDaily = {}; 
const dailyStreak = {}; // NEW: Streak system
const lastWork = {}; 
const userJob = {}; 
const userPartner = {}; 
const activeProposals = {}; 
const lastTea = {};
const userBio = {};

// --- CONFIGURATIONS ---
const jobs = {
  "Intern 🗑️": { req: 0, pay: 15 },
  "Stylist 💅": { req: 100, pay: 50 },
  "Influencer 📸": { req: 300, pay: 100 },
  "Model 👠": { req: 600, pay: 200 },
  "CEO of Sass 💍": { req: 1200, pay: 500 }
};

const extendedShop = {
  "sparkles": { cost: 100, emoji: "✨", desc: "Add some glitz to your profile." },
  "coffee": { cost: 50, emoji: "☕", desc: "Stay awake during meetings." },
  "heels": { cost: 500, emoji: "👠", desc: "Step on the haters." },
  "gucci-bag": { cost: 1500, emoji: "🛍️", desc: "Carry your tea in style." },
  "rolex": { cost: 3000, emoji: "💎", desc: "Time is money, honey." },
  "crown": { cost: 10000, emoji: "👑", desc: "The ultimate baddie flex." },
  "wedding-ring": { cost: 5000, emoji: "💍", desc: "To secure the bag... and love." }
};

// --- CLIENT READY ---
client.on('ready', () => {
  console.log(`${client.user.tag} is in the building and looking expensive! 💅✨`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();
  const userId = message.author.id;
  const target = message.mentions.users.first();

  // --- DATA INITIALIZATION ---
  if (!userReputation[userId]) userReputation[userId] = 0;
  if (!userBank[userId]) userBank[userId] = 0;
  if (!userInventory[userId]) userInventory[userId] = [];
  if (!userJob[userId]) userJob[userId] = "Intern 🗑️";
  if (!activeProposals[userId]) activeProposals[userId] = [];
  if (!dailyStreak[userId]) dailyStreak[userId] = 0;
  if (!userBio[userId]) userBio[userId] = "Just a basic human. 🙄";

  // --- 1. THE BIG SOCIAL SYSTEM ($CMD @USER) ---
  const socialActions = {
    '$wink': `😉 **${message.author.username}** winks at **{t}**. Looking good! ✨`,
    '$stare': `🤨 **${message.author.username}** is staring at **{t}**... Awkward. 💅`,
    '$poke': `👉 **${message.author.username}** pokes **{t}**. Hello? 🙄`,
    '$hug': `🛍️ **${message.author.username}** gives **{t}** a warm hug! Watch the hair! ✨`,
    '$kiss': `💋 **${message.author.username}** kisses **{t}**! How iconic! ❤️`,
    '$kick': `👠 **${message.author.username}** kicks **{t}**! Get out of here! 🗑️`,
    '$slap': `🧤 **${message.author.username}** slaps **{t}**! The audacity! 🤨`,
    '$cuddle': `💖 **${message.author.username}** cuddles with **{t}**. Too cute! ✨`,
    '$pat': `🖐️ **${message.author.username}** pats **{t}** on the head. Good local. 💅`,
    '$glare': `🤨 **${message.author.username}** is glaring at **{t}**. Someone's mad! 🤫`,
    '$holdhand': `🤝 **${message.author.username}** holds **{t}**'s hand. Expensive energy! 💍`,
    '$wave': `👋 **${message.author.username}** waves at **{t}** from the VIP lounge. 💅`
  };

  const command = content.split(' ')[0];
  if (socialActions[command]) {
    if (!target) return message.reply("Mention someone to interact with! 💅");
    const response = socialActions[command].replace('{t}', target.username);
    return message.channel.send(response);
  }

  // --- 2. LUXURY SHOP & INVENTORY ---
  if (content === '$shop') {
    let shopEmbed = "🛍️ **BADDIE'S LUXURY BOUTIQUE** 🛍️\n\n";
    for (const [name, info] of Object.entries(extendedShop)) {
      shopEmbed += `**${name}** ${info.emoji} — ${info.cost} Rep\n*${info.desc}*\n\n`;
    }
    return message.reply(shopEmbed + "Type `$buy [item]` to upgrade your life. 💎");
  }

  if (content.startsWith('$buy ')) {
    const itemName = content.split(' ')[1];
    const item = extendedShop[itemName];
    if (!item) return message.reply("We don't sell basic stuff like that. 🙄");
    if (userReputation[userId] < item.cost) return message.reply("Your wallet is looking a bit thin. 🤢");

    userReputation[userId] -= item.cost;
    userInventory[userId].push(item.emoji);
    return message.reply(`You bought the **${itemName}** ${item.emoji}! You're glowing. ✨`);
  }

  if (content === '$inventory') {
    const items = userInventory[userId].length > 0 ? userInventory[userId].join(' ') : "Nothing yet. 🗑️";
    return message.reply(`**Your Luxury Collection:**\n${items}`);
  }

  // --- 3. STREAK-BASED DAILY SYSTEM ---
  if (content === '$daily') {
    const now = Date.now();
    const cooldown = 86400000;
    const last = lastDaily[userId] || 0;

    if (now - last < cooldown) {
      const timeLeft = cooldown - (now - last);
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      return message.reply(`Patience! 🙄 Next daily in **${hours}h ${mins}m**. 🤫`);
    }

    if (now - last < cooldown * 2) {
      dailyStreak[userId]++;
    } else {
      dailyStreak[userId] = 1;
    }

    const bonus = dailyStreak[userId] * 10;
    userReputation[userId] += (50 + bonus);
    lastDaily[userId] = now;
    return message.reply(`Daily 50 Rep + **${bonus} Streak Bonus** added! Streak: **${dailyStreak[userId]}** days. 🛍️✨`);
  }

  // --- 4. BANKING & BALANCE ---
  if (content.startsWith('$dep ')) {
    const amount = parseInt(content.split(' ')[1]);
    if (isNaN(amount) || amount > userReputation[userId]) return message.reply("Invalid amount, sweetie. 🙄");
    userReputation[userId] -= amount;
    userBank[userId] += amount;
    return message.reply(`Deposited **${amount} Rep**. Safe and sound! 🏦`);
  }

  if (content.startsWith('$with ')) {
    const amount = parseInt(content.split(' ')[1]);
    if (isNaN(amount) || amount > userBank[userId]) return message.reply("Your bank account said 'No'. 🤢");
    userBank[userId] -= amount;
    userReputation[userId] += amount;
    return message.reply(`Withdrew **${amount} Rep**. Go spend it! 🛍️`);
  }

  if (content === '$bal') {
    return message.reply(`**Pocket:** ${userReputation[userId]} 💸\n**Bank Vault:** ${userBank[userId]} 🏦`);
  }

  // --- 5. WORK & CAREERS ---
  if (content === '$jobs') {
    let jList = "💼 **AVAILABLE CAREERS** 💼\n\n";
    for (const [name, info] of Object.entries(jobs)) {
      jList += `**${name}**\nReq: ${info.req} Rep | Pay: ${info.pay} Rep\n\n`;
    }
    return message.reply(jList + "Use `$apply [job]` to move up! 💅");
  }

  if (content.startsWith('$apply ')) {
    const jobName = message.content.substring(7).trim();
    const jobKey = Object.keys(jobs).find(j => j.toLowerCase().includes(jobName.toLowerCase()));
    if (!jobKey) return message.reply("That's not a real career path. 🙄");
    if (userReputation[userId] < jobs[jobKey].req) return message.reply("You aren't iconic enough for this yet. 🤢");
    userJob[userId] = jobKey;
    return message.reply(`Congrats! You are now a **${jobKey}**. 💼✨`);
  }

  if (content === '$work') {
    const now = Date.now();
    if (now - (lastWork[userId] || 0) < 3600000) return message.reply("Take a 1 hour break. 😴");
    const pay = jobs[userJob[userId]].pay;
    userReputation[userId] += pay;
    lastWork[userId] = now;
    return message.reply(`Worked as a **${userJob[userId]}** and earned **${pay} Rep**. 🤑💅`);
  }

  // --- 6. PROPOSALS & MARRIAGE ---
  if (content === '$proposals') {
    const list = activeProposals[userId] || [];
    if (list.length === 0) return message.reply("No one is begging for your attention. 🙄");
    const msg = "💍 **YOUR PROPOSALS** 💍\n" + list.map((id, i) => `${i + 1}. <@${id}>`).join('\n');
    return message.reply(msg + "\nType `$accept [number]`! 💖");
  }

  if (content.startsWith('$marry')) {
    if (!target || target.id === userId) return message.reply("Mention someone else! 💅");
    if (!userInventory[userId].includes('💍')) return message.reply("You need a `wedding-ring` from the shop! 💍");
    activeProposals[target.id] = activeProposals[target.id] || [];
    activeProposals[target.id].push(userId);
    return message.reply(`Proposal sent to ${target.username}! 💎`);
  }

  if (content.startsWith('$accept ')) {
    const index = parseInt(content.split(' ')[1]) - 1;
    const list = activeProposals[userId];
    if (!list || !list[index]) return message.reply("Invalid proposal number. 🙄");
    userPartner[userId] = list[index];
    userPartner[list[index]] = userId;
    activeProposals[userId] = [];
    return message.channel.send(`🎉 Married! We love a power couple. 💍💖✨`);
  }
});

client.login("YOUR_TOKEN_HERE");
