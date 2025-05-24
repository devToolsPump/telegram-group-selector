const { Client } = require("telegram");
const { StringSession } = require("telegram/sessions");

module.exports = async (req, res) => {
  try {
    const user_id = parseInt(req.query.user_id);
    console.log(`Fetching groups for user ${user_id}`);

    // Initialize client with session file
    const client = new Client({
      apiId: parseInt(process.env.TELEGRAM_API_ID),
      apiHash: process.env.TELEGRAM_API_HASH,
      session: new StringSession(process.env.TELEGRAM_SESSION || "") // Use env var or empty session
    });

    await client.connect();
    console.log("Connected to Telegram");

    const eligibleGroups = [];
    const dialogs = await client.getDialogs();
    console.log(`Processing ${dialogs.length} dialogs`);

    for (const dialog of dialogs) {
      try {
        // Only check groups (not channels or private chats)
        if (dialog.isGroup) {
          const admins = await client.getParticipants(dialog.entity, { 
            filter: "admins" 
          });
          
          const isUserAdmin = admins.some(admin => 
            admin.id.toString() === user_id.toString()
          );
          
          if (isUserAdmin) {
            eligibleGroups.push({
              id: dialog.entity.id,
              title: dialog.entity.title,
              members_count: dialog.entity.participantsCount || 0
            });
          }
        }
      } catch (e) {
        console.log(`Skipping dialog ${dialog.id}:`, e.message);
      }
    }

    console.log(`Found ${eligibleGroups.length} eligible groups`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ 
      success: true,
      groups: eligibleGroups 
    });

  } catch (e) {
    console.error("API Error:", e);
    res.status(500).json({ 
      success: false,
      error: e.message 
    });
  } finally {
    await client?.disconnect();
  }
};
