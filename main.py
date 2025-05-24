from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pyrogram import Client

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# Pyrogram client setup
api_id = os.getenv("TELEGRAM_API_ID")
api_hash = os.getenv("TELEGRAM_API_HASH")
bot_token = os.getenv("TELEGRAM_BOT_TOKEN")

@app.get("/api/groups")
async def get_eligible_groups(user_id: int):
    groups = []
    
    async with Client("my_session", api_id=api_id, api_hash=api_hash) as app:
        async for dialog in app.get_dialogs():
            if dialog.chat.type in ["group", "supergroup"]:
                try:
                    # Check if user is admin and bot isn't
                    admins = await app.get_chat_members(dialog.chat.id, filter="administrators")
                    user_is_admin = any(admin.user.id == user_id for admin in admins)
                    bot_is_admin = any(admin.user.id == (await app.get_me()).id for admin in admins)
                    
                    if user_is_admin and not bot_is_admin:
                        groups.append({
                            "id": dialog.chat.id,
                            "title": dialog.chat.title,
                            "members_count": dialog.chat.members_count
                        })
                except Exception as e:
                    continue
    
    return groups
