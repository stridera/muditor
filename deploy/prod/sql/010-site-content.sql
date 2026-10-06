-- Idempotent: seed the initial public-website content (rules, new player guide,
-- world lore, welcome news). Existing rows (matched by slug) are left untouched
-- so builder edits are never overwritten.
-- Run: psql -U strider -d fierydev -f apps/api/scripts/seed-site-content.sql
INSERT INTO "SiteContent" ("id", "slug", "kind", "title", "summary", "body", "published", "publishedAt", "sortOrder", "authorId", "createdAt", "updatedAt")
VALUES
(
  gen_random_uuid()::text, 'welcome', 'NEWS', 'Welcome to the new website',
  'Our new public website is live.',
  $body$
The new FieryMUD website is here! You can now browse the help files, races and classes, read the rules and the new player guide, and check whether the server is online, all without logging in. Builders can edit these pages from Muditor at any time, so check back for news and lore updates.
$body$,
  true, now(), 0, NULL, now(), now()
),
(
  gen_random_uuid()::text, 'newbie-guide', 'PAGE', 'New Player Guide',
  'Everything you need to connect, create a character, and take your first steps.',
  $body$
# New Player Guide

Welcome to FieryMUD! This guide gets you from connecting to your first fight.

## Connecting

FieryMUD is a text game. Use any MUD client (Mudlet, TinTin++, MUSHclient, or a plain `telnet`) and connect to:

- **Host:** `fierymud.org`
- **Port:** `4003` (telnet), or `4443` for an encrypted TLS connection

## Creating a character

1. At the login prompt, type a new character name and confirm it.
2. Choose a password you do not use anywhere else.
3. Pick a **race** and a **class**. Read the race and class pages on this site first; your choices shape your stats, abilities, and starting town.
4. Follow the prompts for gender and any other options, then press Enter to enter the world.

## Basic commands

| Command | What it does |
| --- | --- |
| `look` | Describe the room you are in. `look <thing>` examines something specific. |
| `north`, `south`, `east`, `west`, `up`, `down` | Move in that direction (`n`, `s`, `e`, `w`, `u`, `d` for short). |
| `get <item>` | Pick up an item. `get all` picks up everything. |
| `wear <item>` | Put on a piece of armor or clothing. |
| `wield <weapon>` | Equip a weapon. |
| `kill <monster>` | Start a fight. |
| `score` | Show your level, hit points, experience, and other statistics. |
| `inventory` | List what you are carrying (`i` for short). |
| `equipment` | List what you are wearing and wielding. |
| `help <topic>` | Read the in-game help for any command or spell. |

## Where to start

Your starting town is full of friendly places and easy monsters. Look around, read room descriptions, and explore. Pick fights you can win: check a monster with `consider <monster>` before attacking, and rest or sit to recover hit points between fights. Gear dropped by monsters and bought in shops will make you much stronger, so wear and wield anything useful you find.

## Grouping

Adventuring together is faster and safer. Use `follow <player>` to follow someone, and `group` to see your party. Group leaders can invite others into the group, and everyone in the group shares experience. Try to balance your party with fighters, healers, and damage dealers.

## Asking for help

- Use `help <topic>` in game, or search the help files on this site.
- Ask on the newbie or chat channels. Experienced players are usually glad to help.
- If you see a bug or are stuck, tell an immortal. Staff members are glad to help.

Read the Rules page before you play, and enjoy your adventure!
$body$,
  true, now(), 10, NULL, now(), now()
),
(
  gen_random_uuid()::text, 'rules', 'PAGE', 'Rules',
  'The rules every player agrees to follow. Breaking them can lead to a warning, suspension, or a ban.',
  $body$
# Rules

FieryMUD is a game for everyone to enjoy. By playing here you agree to follow these rules. Staff decisions are final, and penalties range from a warning to a permanent ban depending on severity.

1. **No player-killing.** Do not attack other players unless they have clearly agreed to a duel in a designated place. Unprovoked player-killing is not permitted.
2. **Protect low-level players.** Do not harass, scam, or exploit newer players. Help them if you can, and never use your strength to bully them.
3. **No bug exploiting.** If you discover a bug, report it to staff instead of using it. Abusing bugs to gain experience, gold, or items can result in rollbacks and penalties.
4. **Character and multiplaying limits.** You may keep several characters, but you may not use more than one at the same time to gain an advantage, such as passing items, farming, or blocking. Do not share accounts.
5. **No harassment.** Hate speech, threats, stalking, and persistent abuse of other players or staff are not tolerated, in game or on any connected community channel.
6. **No kill-stealing.** Do not steal another player's monster, loot, or experience. Ask before joining a fight and respect those who started it first.
7. **Respect the staff.** Follow instructions from immortals and be polite to them. If you disagree with a decision, raise it calmly through the proper channel rather than arguing in public.
8. **Keep out-of-character chatter on OOC channels.** In-game channels and rooms are for the game world. Use the OOC channels for real-life talk, and keep arguments and spoilers out of the main channels.

If you see a violation, tell a staff member. Rules may be updated at any time, so check this page occasionally.
$body$,
  true, now(), 20, NULL, now(), now()
),
(
  gen_random_uuid()::text, 'world', 'LORE', 'The World of Ethilien',
  'DRAFT PLACEHOLDER TEXT. Builders: replace this lore with the real history of Ethilien.',
  $body$
> **Draft text.** This lore is placeholder copy written so the website has something to show. Builders can edit or replace it in Muditor at any time.

Ethilien is a land of ash and ember, where the old kingdoms lie in ruins beneath a sky that never quite clears. Centuries ago a great fire swept across the continent and burned the empires of men, elves, and dwarves to their foundations. What survived did so in scattered strongholds and hidden valleys, huddled around fires that the survivors refuse to let go out.

In the silence after the burning, new powers rose. Cults tend the embers of forgotten gods, hollow lords rule crumbling keeps from thrones of cold iron, and creatures that once hid from the daylight now walk freely through the broken roads. The old magic is still there, but it is wild and hungry, and those who use it pay a price.

Adventurers come to Ethilien for many reasons: glory, gold, vengeance, or the hope of rebuilding something worth keeping. Whatever drives you, the road is long, the nights are dark, and the fires you light along the way may be the only thing standing between the world and the cold.
$body$,
  true, now(), 30, NULL, now(), now()
)
ON CONFLICT ("slug") DO NOTHING;
