const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

// --- NEW SYSTEMS ---
const lastWork = {}; 
const userPets = {}; 
const lastFeed = {}; 
const userPartner = {}; // NEW: Track marriages
const userJob = {}; // NEW: Job System
const petLevel = {}; // NEW: Pet Evolution

const teaVault = [
  "I heard someone in this server is wearing fake designer... but I won't say who. 🤐",
  "My bank account called, it said I'm too iconic to be working today. 💅",
  "Life is short, make every outfit count. Some of you clearly missed the memo. 🙄",
  "I’m not arguing, I’m just explaining why I’m right. 💎",
  "Being this perfect is actually exhausting. 😴",
  "Success is the best revenge, but a new outfit is a close second. 🛍️",
  "I don't follow trends, I am the trend. 💅✨",
  "That outfit you wore yesterday? I have thoughts... 🤐",
  "If you can't love yourself, how are you gonna love me? 🙄",
  "I'm not rude, I'm just honest. And you look basic. 💅"
];

const shopItems = {
  "sunglasses": { cost: 50, description: "Look cool while ignoring haters." },
  "gucci-bag": { cost: 150, description: "Carry your ego in style." },
  "coffee": { cost: 20, description: "For when Baddie is tired." },
  "rolex": { cost: 500, description: "Time is money, bestie." },
  "diamond-ring": { cost: 1000, description: "For the ultimate icon." },
  "pet-food": { cost: 10, description: "Keep your pet alive." },
  "wedding-ring": { cost: 2000, description: "To secure the bag... I mean, love. 💍" } // NEW
};

client.on('ready', () => {
  console.log(`${client.user.tag} is officially in the building! 💅✨`);
  
  // Mood Switcher: Changes every 10 mins
  setInterval(() => {
    const moods = ['fabulous', 'bored', 'sassy', 'tired', 'dramatic', 'expensive', 'unbothered', 'hungover', 'judgemental'];
    baddieMood = moods[Math.floor(Math.random() * moods.length)];
    console.log(`Mood check: Baddie is feeling ${baddieMood}`);
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
  if (!userPets[userId]) userPets[userId] = null;
  if (!userPartner[userId]) userPartner[userId] = null; // Initialize partner
  if (!userJob[userId]) userJob[userId] = "Unemployed 🗑️";
  if (!petLevel[userId]) petLevel[userId] = 1;

  // --- XP SYSTEM ---
  userXP[userId] += 5;
  if (userXP[userId] >= userLevel[userId] * 100) {
    userLevel[userId]++;
    userXP[userId] = 0;
    message.channel.send(`🎉 **${message.author.username}** just leveled up to **Level ${userLevel[userId]}**! Getting more iconic every day. 💅✨`);
  }

  // --- 1. PASSIVE REACTIONS ---
  if (content.includes('shopping') || content.includes('money') || content.includes('nails')) {
    message.react('💅');
  }
  if (content.includes('ugly') || content.includes('broke') || content.includes('basic')) {
    message.react('🤢');
  }
  if (content.includes('baddie')) {
    message.react('👑');
  }

  // --- 2. MOOD RESPONSES ---
  if (content.includes('baddie') && (content.includes('slay') || content.includes('love') || content.includes('iconic'))) {
    userReputation[userId] += 2;
    if (baddieMood === 'tired') return message.reply('Compliment accepted, but I still need a nap. 😴');
    if (baddieMood === 'sassy') return message.reply('I know, I know. Don\'t state the obvious. 🙄');
    if (baddieMood === 'hungover') return message.reply('Too loud. Please whisper. 🤫');
    if (baddieMood === 'judgemental') return message.reply('I’m judging your outfit right now. 🤨');
    return message.reply('Obviously. 💅');
  }

  // --- 3. COMMAND: $TOP (HALL OF FAME) ---
  if (content.startsWith('$top')) {
    const sorted = Object.entries(userReputation)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); 

    if (sorted.length === 0) return message.reply("Nobody is iconic yet. Go do something! 🙄");

    let leaderboard = "🏆 **THE BADDIE HALL OF FAME** 🏆\n\n";
    const icons = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

    for (let i = 0; i < sorted.length; i++) {
      const [id, rep] = sorted[i];
      try {
        const user = await client.users.fetch(id);
        leaderboard += `${icons[i]} **${user.username}** — ${rep} Rep (Iconic!)\n`;
      } catch (e) {
        leaderboard += `${icons[i]} **Unknown User** — ${rep} Rep\n`;
      }
    }

    return message.reply(leaderboard + "\n*If you're not on here, try harder. 💅*");
  }

  // --- 4. COMMAND: $FIGHT ---
  if (content.startsWith('$fight')) {
    const opponent = message.mentions.users.first();
    if (!opponent) return message.reply('Mention a victim—I mean, a "friend"—to fight. 💅');
    if (opponent.id === userId) return message.reply('Fighting yourself? That’s a new level of local. 🙄');

    const winner = Math.random() > 0.5 ? message.author : opponent;
    const loser = winner.id === userId ? opponent : message.author;
    
    userReputation[winner.id] += 5;
    userReputation[loser.id] -= 3;

    return message.reply(`**SASS BATTLE RESULTS** 🎤\n**Winner:** ${winner} (Absolute Icon! +5 Rep)\n**Loser:** ${loser} (Go sit in the corner. -3 Rep) 💅✨`);
  }

  // --- 5. COMMAND: $DAILY ---
  if (content.startsWith('$daily')) {
    const now = Date.now();
    const cooldown = 86400000; 

    if (lastDaily[userId] && (now - lastDaily[userId]) < cooldown) {
      const remaining = Math.ceil((cooldown - (now - lastDaily[userId])) / 3600000);
      return message.reply(`Patience is a virtue you clearly don't have. Wait ${remaining} more hours for your allowance. 🙄`);
    }

    lastDaily[userId] = now;
    userReputation[userId] += 10;
    return message.reply('Here is your daily 10 reputation points. Spend it wisely. 🛍️✨');
  }

  // --- 6. COMMAND: $SHOP ---
  if (content.startsWith('$shop')) {
    let shopMsg = "🛍️ **BADDIE'S EXCLUSIVE SHOP** 🛍️\n\n";
    for (let item in shopItems) {
      shopMsg += `**${item}** (${shopItems[item].cost} Rep) - ${shopItems[item].description}\n`;
    }
    shopMsg += "\nType `$buy [item]` to purchase.";
    return message.reply(shopMsg);
  }

  // --- 7. COMMAND: $BUY ---
  if (content.startsWith('$buy ')) {
    const itemName = content.split(' ')[1];
    const item = shopItems[itemName];

    if (!item) return message.reply("That item doesn't exist in my boutique. 🙄");
    if (userReputation[userId] < item.cost) return message.reply("You are too broke for this. Get more Rep. 🤢");

    userReputation[userId] -= item.cost;
    userInventory[userId].push(itemName);
    return message.reply(`You bought **${itemName}**! You're slightly less basic now. 💎`);
  }

  // --- 8. COMMAND: $DRAMA ---
  if (content.startsWith('$drama')) {
    const dramas = [
        "I heard a rumor that someone is stealing snacks from the fridge. 🤐",
        "It's giving... fake personalities in this channel. 🙄",
        "I'm not saying names, but *someone* needs a glow-up. 💅",
        "The tea is getting cold, but the drama is just heating up! ☕",
        "Honestly? The vibes in here are immaculate... just kidding, they're trash. 🗑️"
    ];
    return message.reply(dramas[Math.floor(Math.random() * dramas.length)]);
  }

  // --- 9. COMMAND: $ROAST ---
  if (content.startsWith('$roast')) {
    const roasts = [
        "Are you waiting for a compliment? Because I only give those to people I like. 💅",
        "Did you get dressed in the dark? 🙄",
        "I’ve met bread that had more personality than you. 🤢",
        "I’d explain it to you, but I don’t have the time or the crayons. 💅✨",
        "You're the reason I look down on people. 🤨"
    ];
    return message.reply(roasts[Math.floor(Math.random() * roasts.length)]);
  }

  // --- 10. COMMAND: $PROFILE ---
  if (content.startsWith('$profile')) {
    const user = message.author;
    const rep = userReputation[userId];
    const rank = rep > 50 ? "Iconic Legend 👑" : rep > 10 ? "Rising Star ✨" : "Broke & Basic 🤢";
    const inventory = userInventory[userId].length > 0 ? userInventory[userId].join(', ') : "Empty 🛍️";
    const pet = userPets[userId] ? `🐶 ${userPets[userId]} (Lv. ${petLevel[userId]})` : "None 🥺";
    const partner = userPartner[userId] ? `<@${userPartner[userId]}> 💖` : "Single 💅"; // NEW

    const profileEmbed = new EmbedBuilder()
      .setColor(0xFF00FF)
      .setTitle(`💖 ${user.username}'s Baddie Profile`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: 'Rank', value: rank, inline: true },
        { name: 'Level', value: `${userLevel[userId]}`, inline: true },
        { name: 'Reputation', value: `${rep}`, inline: true },
        { name: 'Mood', value: baddieMood, inline: true },
        { name: 'Partner', value: partner, inline: true }, // NEW
        { name: 'Job', value: userJob[userId], inline: true }, // NEW
        { name: 'Inventory', value: inventory },
        { name: 'Pet', value: pet },
        { name: 'Bio', value: userBio[userId] }
      )
      .setFooter({ text: 'Baddie AI System' });

    return message.reply({ embeds: [profileEmbed] });
  }

  // --- 11. COMMAND: $SETBIO ---
  if (content.startsWith('$setbio ')) {
    const newBio = message.content.substring(8);
    if (newBio.length > 50) return message.reply("Keep it short, bestie. 50 characters max. 💅");
    userBio[userId] = newBio;
    return message.reply("Bio updated! ✨");
  }

  // --- 12. COMMAND: $8BALL ---
  if (content.startsWith('$8ball ')) {
    const question = message.content.substring(7);
    if (!question) return message.reply("Ask a question, icon. 💅");
    const answers = [
        "Obviously. 💅",
        "Imagine thinking that's a good idea. 🙄",
        "Absolutely not. 🤢",
        "Ask me when I'm not expensive. 💎",
        "In your dreams. ✨"
    ];
    return message.reply(`Question: ${question}\nBaddie says: ${answers[Math.floor(Math.random() * answers.length)]}`);
  }

  // --- 13. COMMAND: $SLAP ---
  if (content.startsWith('$slap')) {
    const target = message.mentions.users.first();
    if (!target) return message.reply("Mention someone to slap! 💅");
    return message.channel.send(`*${message.author.username} dramatically slaps ${target.username} with a glove.* How dare you. 🧤`);
  }

  // --- 14. COMMAND: $HUG ---
  if (content.startsWith('$hug')) {
    const target = message.mentions.users.first();
    if (!target) return message.reply("Mention someone to hug! 💅");
    return message.channel.send(`*${message.author.username} gives ${target.username} a reluctant, expensive hug.* 🛍️`);
  }

  // --- 15. COMMAND: $WORK ---
  if (content.startsWith('$work')) {
      const now = Date.now();
      const cooldown = 3600000; // 1 hour

      if (lastWork[userId] && (now - lastWork[userId]) < cooldown) {
          return message.reply("You can't work this hard! Take a break. 🙄");
      }

      let earnings = Math.floor(Math.random() * 20) + 5;
      
      // Job bonus
      if (userJob[userId] === "CEO of Sass 👑") earnings += 20;

      userReputation[userId] += earnings;
      lastWork[userId] = now;
      return message.reply(`You worked hard and earned ${earnings} Rep! 💼✨`);
  }

  // --- 16. COMMAND: $ADOPT ---
  if (content.startsWith('$adopt ')) {
      if (userPets[userId]) return message.reply("You already have a pet! 🐶");
      const petName = message.content.substring(7);
      if (!petName) return message.reply("Give your pet a name! 💅");
      userPets[userId] = petName;
      lastFeed[userId] = Date.now();
      return message.reply(`You adopted **${petName}**! Take care of it. 🐾`);
  }

  // --- 17. COMMAND: $FEED ---
  if (content.startsWith('$feed')) {
      if (!userPets[userId]) return message.reply("You don't have a pet to feed! 🥺");
      if (!userInventory[userId].includes('pet-food')) return message.reply("Buy `pet-food` in the shop first! 🛍️");
      
      userInventory[userId].splice(userInventory[userId].indexOf('pet-food'), 1);
      lastFeed[userId] = Date.now();
      petLevel[userId]++; // NEW: Pet levels up
      return message.reply(`You fed **${userPets[userId]}**! It's happy now. Pet is now Level ${petLevel[userId]}! 🐶❤️`);
  }

  // --- 18. COMMAND: $COINFLIP ---
  if (content.startsWith('$coinflip ')) {
      const bet = parseInt(content.split(' ')[1]);
      if (isNaN(bet) || bet <= 0) return message.reply("Bet a real amount of Rep. 🙄");
      if (userReputation[userId] < bet) return message.reply("You can't bet what you don't have. 🤢");

      const result = Math.random() > 0.5 ? "heads" : "tails";
      const userGuess = content.split(' ')[2];
      
      if (userGuess !== "heads" && userGuess !== "tails") return message.reply("Guess `heads` or `tails`. 💅");

      if (result === userGuess) {
          userReputation[userId] += bet;
          return message.reply(`It was ${result}! You doubled your money. 🤑✨`);
      } else {
          userReputation[userId] -= bet;
          return message.reply(`It was ${result}! You lost your bet. Basic. 💅`);
      }
  }

  // --- 19. COMMAND: $MARRY ---
  if (content.startsWith('$marry')) {
      const target = message.mentions.users.first();
      if (!target) return message.reply("Mention someone to marry! 💍");
      if (target.id === userId) return message.reply("Marrying yourself? That's sad. 🙄");
      if (target.bot) return message.reply("You cannot marry a bot. 💅");
      if (userPartner[userId]) return message.reply("You are already married! 💖");
      if (userPartner[target.id]) return message.reply("That person is already married! 💅");
      if (!userInventory[userId].includes('wedding-ring')) return message.reply("You need a `wedding-ring` from the shop to propose! 💍");

      message.channel.send(`${target}, ${message.author} wants to marry you! Do you accept? Type \`$accept\` to marry or \`$deny\` to reject. 💖`);
      
      // Temporary storage for proposal
      client.proposal = { proposer: userId, target: target.id };
  }

  // --- 20. COMMAND: $ACCEPT ---
  if (content.startsWith('$accept')) {
      if (!client.proposal || client.proposal.target !== userId) return message.reply("No one has proposed to you. 🙄");
      
      const { proposer, target } = client.proposal;
      
      userPartner[proposer] = target;
      userPartner[target] = proposer;
      
      // Remove ring from inventory
      userInventory[proposer].splice(userInventory[proposer].indexOf('wedding-ring'), 1);
      
      client.proposal = null;
      return message.channel.send(`🎉 **${message.author.username}** and <@${proposer}> are now married! How iconic! 💖💍`);
  }

  // --- 21. COMMAND: $DENY ---
  if (content.startsWith('$deny')) {
      if (!client.proposal || client.proposal.target !== userId) return message.reply("No one has proposed to you. 🙄");
      client.proposal = null;
      return message.reply("You rejected the proposal. Savage. 💅");
  }

  // --- 22. COMMAND: $DIVORCE ---
  if (content.startsWith('$divorce')) {
      if (!userPartner[userId]) return message.reply("You aren't married. 💅");
      
      const partnerId = userPartner[userId];
      userPartner[userId] = null;
      userPartner[partnerId] = null;
      
      return message.channel.send(`💔 <@${userId}> and <@${partnerId}> have divorced. The drama! 🙄`);
  }

  // --- 23. COMMAND: $APPLY ---
  if (content.startsWith('$apply')) {
      if (userJob[userId] !== "Unemployed 🗑️") return message.reply("You already have a job! Type `$quit` to leave. 💅");
      userJob[userId] = "CEO of Sass 👑";
      return message.reply("You are now the **CEO of Sass**! Time to get rich. 💼✨");
  }

  // --- 24. COMMAND: $QUIT ---
  if (content.startsWith('$quit')) {
      if (userJob[userId] === "Unemployed 🗑️") return message.reply("You don't have a job! 🙄");
      userJob[userId] = "Unemployed 🗑️";
      return message.reply("You quit your job. Basic. 💅");
  }

  // --- 25. COMMAND: $SHARE ---
  if (content.startsWith('$share')) {
      if (!userPartner[userId]) return message.reply("You need a partner to share with! 💖");
      const amount = parseInt(content.split(' ')[1]);
      if (isNaN(amount) || amount <= 0) return message.reply("Share a valid amount of Rep. 🙄");
      if (userReputation[userId] < amount) return message.reply("You don't have that much Rep. 🤢");

      userReputation[userId] -= amount;
      userReputation[userPartner[userId]] += amount;
      
      return message.reply(`You shared ${amount} Rep with your partner! So romantic. 💍✨`);
  }

  // --- 26. COMMAND: $SETMOOD ---
  if (content.startsWith('$setmood ')) {
      if (message.author.id !== "YOUR_USER_ID_HERE") return message.reply("Only the Baddie admin can do this. 👑");
      const newMood = content.substring(9);
      baddieMood = newMood;
      return message.reply(`Baddie mood updated to: ${newMood} 💅`);
  }

  // --- 27. PREVIOUS COMMANDS ---
  if (content.startsWith('$checkrep')) {
    const rep = userReputation[userId];
    let rank = rep > 50 ? "Iconic Legend 👑" : rep > 10 ? "Rising Star ✨" : "Broke & Basic 🤢";
    return message.reply(`**User Status Report**\nReputation: ${rep}\nRank: ${rank}`);
  }

  if (content.startsWith('$rate')) {
    const rating = Math.floor(Math.random() * 10) + 1;
    return message.reply(rating > 7 ? `That's a ${rating}/10. Looking expensive! 🔥` : `It's a ${rating}/10. Try harder. 💅`);
  }

  if (content.startsWith('$tea')) {
    return message.reply(teaVault[Math.floor(Math.random() * teaVault.length)]);
  }

  if (content.startsWith('$glowup')) {
    if (Math.random() > 0.7) {
      userReputation[userId] += 10;
      return message.reply('OMG! Major glow-up alert! 💎✨');
    } else {
      userReputation[userId] -= 2;
      return message.reply('The glow-up failed. Embarrassing for you. 💅🤢');
    }
  }
});

client.login(process.DISCORD_TOKEN);
