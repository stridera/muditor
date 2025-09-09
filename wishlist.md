# Database

## Current Concerns

We currently store items by ID, moving away from having a separate vnum. However, I'm rethinking this. We'll need a away to handle specific items separate from the prototypes. For example, a character can get a torch and use it until it's dead, or drink the liquid in a drink container. We also want to be able to add flags like cursed, blessed, etc. We need a way to store the current state of an item held by a character that is separate from the prototype item.

## New tables

### Character Table

- Character: Name, Password, Stats. Use character reference for all stats.
- Items: Character_id, Item_id, Equip Location (if equipped), Extra flags (Flags attached to an item separate from the defaults.)
- Will need to figure out a way to store contained items.

### Help Tables

- Contain Keyword driven help files using Markdown.
  - In the mud, we'll use these keywords for the search. Consider how to handle single and multiple word keywords.

# Muditor User Stories

## Terminology

- _User_: The actual person creating the account.
- _Character_: The in-game characters owned by a user.
- _Player Page_: The 'half' of the website that shows player functionality. (Character list, Basic Mud Stats)
- _God Page_: The other 'half' of the website. This should only show to Users with a God character. (Level 100+)

## Priorities

**High Priority**: Core Functionality and Security. Testing and verification.
**Standard Priority**: Normal functionality
**Low Priority**: MUD API integration. Should document what requests we want to make, but can be delayed until MUD API is build.

## Account, Login, And Security

### Account Creation and Player Levels (High Priority)

- User creates a new account. They will be taken to a Player page of level 0.
- User adds 4 characters of level 20, 30, 50, 98. This will update their page to Player 98 (max level of all characters.)
- User plays the game and gains level 99. This should send a message to update the character and Player page to Player 99.
- User adds a god character of level 105. This will update their level to God 105 and give access to god functionality.

### User Login

- User logins using username or email and password. Has ability to reset password via email.
- User adds characters using their character username and password.

### User Profile

- Shows User details, like Username, Level, avatar, etc.
- Lower-Level gods, show 'assigned' zones that they have the ability to edit.
- Allow Password Change

### User Settings

- View/Change user settings.
  - Low Priority: Change Theme (Light/Dark)

### Mud Login

- User logs in to the MUD using their email address. They are given the option to use a password or verify using the website.
- A popup will show up in the website for the logged in user allowing them to approve the login.

### Mud API access

- User will use the same JWT token for the MUD API. This will allow them to do commands via their user. (And with their correct permission level.)
- Depending on access, diffent abilities will be available:
  - Players to force a character to logout.
  - Gods can trigger resets (Zone, object, etc), force logouts/bans, etc (depending on god level)

## Player Page

### View Characters

- User can view a list of their current characters.
- User is presented with a list of characters and basic stats (Name, Class, Level, Etc). We will show a 'logged in' badge if the character is online in the game.
- User can select a character to get full details depending on level. (For example, we want to hide basic stats until PLAYER level 10)
- If the character is LOGGED IN, the user only view character details or can trigger a force logout.
- If the character is LOGGED OUT, the user can shift items between other LOGGED OUT characters, or via the character bank.
- Characters should get live updates whenever the database is updated via the game.

### Help

- Shows the current help. Should start on the basic 'help' window with links to related topics.
- User can search for help topics. (Keyword or Full Text Search)

## God Page

### God Dashboard

- Dashboard should show basic MUD stats:
  - Current Data Stats (Zones, objects, Mobs, etc)
  - Current MUD stats (Logged in users, Uptime, other interesting stats.)

### Zone Viewing/Editing

- User selects a zone and view a list of rooms, including objects, mobs, shops, scripts, etc.
- User selects a mob, which will open up the mob view page, including their inventory, equipment, scripts, and attached shops.
- User can then select any of those items to easily jump between the pages.
- All zone entitites are tied to that zone, and can be considered a subpage of the zone. (Zone dashboard, Rooms, Objects, Mobs, Shops, Scripts)
- Editing pages should allow editing of all fields. Flags, Descriptions, dice, stats, effects, etc.

### Live Zone Editor

#### View Mode

- The live editor should show a list of rooms using their X,Y,Z coordinates. In view mode, user can use arrows to shift between rooms via their posted exits. Page-up/down to move Up/Down.
- User can use the Z-Level controls at the top to switch between floors. This should be grayed out if there is only one z-level. Otherwise, it should switch between floors.
- Right side panel shows the selected room details. This should similate what the user see's in the mud. (Room Name, Description, Mobs, Items, Etc.) User can click and drag the divider to allow expanding the side bars.
- Hovering over an entity (mobs/items/etc) should show a popup with that items description as if you looked at it.
- Clicking an entity should go to full details for that entity.

#### Edit Mode

- User still uses movement keys to shift between rooms, similar to the view screen.
- The side bar will show editible room details.
- Keyboard Shortcuts will allow the creation of new exits, mobs, etc. This should ask for a short description and create the new room/entity. Further editing will happen via the side panel or via the dedicated item editing page.

#### Layout Mode

- Same shortcuts to move around. CTRL+Direction to move the room one step in that direction.
- User can select a button to trigger a manual rearrangement. This should take the first room, follow the exits to place their rooms in their logical positions.
  - Attempt to avoid overlapping rooms. If two rooms overlap, clicking that room will select all rooms assigned to that square and the user will need to manually select the one they want.
  - If a direction would cause overlap, it might be required to shift all other rooms over two blocks.
- User can drag/select to select many rooms and shift them all at once
- Rooms above/below are ghosted at an offset.
- Sidebar can be used to show room name/description, and layout details.

### Help Page

- Allow editing of help pages. Should include basic markdown functionality.

### Users Page

- Allows gods to search for users by Email, Username, or Character Name.
- Allows gods to force logouts
- Allow gods to ban users with a reason.
