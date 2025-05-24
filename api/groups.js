import { Client } from "telegram";

export default async (req, res) => {
  const user_id = parseInt(req.query.user_id);
  
  // Initialize Pyrogram client
  const client = new Client({
    apiId: parseInt(process.env.TELEGRAM_API_ID),
    apiHash: process.env.TELEGRAM_API_HASH,
    session: "bot_session"
  });

  await client.connect();

  try {
    const eligibleGroups = [];
    
    // Fetch all groups where user is admin
    for await (const dialog of client.iterDialogs()) {
      if (dialog.isGroup || dialog.isChannel) {
        try {
          const admins = await client.getParticipants(dialog.entity, { filter: "admins" });
          const isUserAdmin = admins.some(admin => admin.id === user_id);
          const isBotAdmin = admins.some(admin => admin.id === (await client.getMe()).id);
          
          if (isUserAdmin && !isBotAdmin) {
            eligibleGroups.push({
              id: dialog.entity.id,
              title: dialog.entity.title,
              members_count: dialog.entity.participantsCount || 0
            });
          }
        } catch (e) {
          console.error(`Skipping group ${dialog.entity.id}: ${e}`);
        }
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ groups: eligibleGroups });
    
  } finally {
    await client.disconnect();
  }
}
