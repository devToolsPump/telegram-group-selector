const { Client } = require("telegram");

module.exports = async (req, res) => {
  try {
    const user_id = parseInt(req.query.user_id);
    console.log("Processing request for user:", user_id);

    const client = new Client({
      apiId: parseInt(process.env.TELEGRAM_API_ID),
      apiHash: process.env.TELEGRAM_API_HASH,
      session: "bot" // Uses bot.session file
    });

    await client.connect();
    console.log("Connected to Telegram");

    const eligibleGroups = [];
    const dialogs = await client.getDialogs();
    
    for (const dialog of dialogs) {
      if (dialog.isGroup) {
        try {
          const admins = await client.getParticipants(dialog.entity, { filter: "admins" });
          const isUserAdmin = admins.some(admin => admin.id.toString() === user_id.toString());
          
          if (isUserAdmin) {
            eligibleGroups.push({
              id: dialog.entity.id,
              title: dialog.entity.title,
              members_count: dialog.entity.participantsCount || 0
            });
          }
        } catch (e) {
          console.log(`Skipping group ${dialog.entity.id}:`, e.message);
        }
      }
    }

    console.log("Found groups:", eligibleGroups.length);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ groups: eligibleGroups });
    
  } catch (e) {
    console.error("API Error:", e);
    res.status(500).json({ error: e.message });
  } finally {
    await client?.disconnect();
  }
};
