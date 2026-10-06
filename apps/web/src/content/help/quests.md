# Quest builder guide

This guide describes how quests actually run on the game server (fierymud-rs) and how to build one in the Quest editor. Everything here was checked against the server code; where the editor offers something the game does not honour yet, it says so.

## Overview

A quest is a row in the shared database. The game server reads quest definitions from the database whenever it needs them, so a saved change applies to the next player action with no restart. The one exception is **dialogue**, which is loaded when the server boots.

A quest has three layers:

- **Quest**: name, level range, how it is offered, flags (Repeatable, Hidden), time limit, and requirements.
- **Phases**: ordered steps. A quest finishes when its last phase finishes.
- **Objectives**: the things a player must do inside a phase (kill, collect, visit, and so on). **Rewards** are attached to the quest and paid when it completes.

### Lifecycle

1. You build the quest in the editor and save it.
2. A player **gets offered** the quest. There is no automatic "talk to the giver" hook: the player types `qaccept <zone> <id>`, or a trigger (level, item, room, skill, event, auto-start) offers it or accepts it for them. See [Offering a quest](#offering-a-quest).
3. On acceptance the server checks the gates: Hidden, Min Level / Max Level, already in progress, already completed (and not Repeatable), cooldown, Exclusive Group, and Prerequisites. The player command `qaccept` also checks the Availability Requirement.
4. The quest becomes **IN_PROGRESS**. If Time Limit (minutes) is set, the countdown starts.
5. Player actions advance matching objectives. Each advance prints a line such as `Quest objective: Kill 5 sewer rats (2/5)`.
6. When every objective in the current phase is done, the quest moves to the next phase (lowest Order first) and prints `Quest phase complete - moving to: <phase name>`.
7. When the last phase is done the quest becomes **COMPLETED**, prints `*** Quest complete! ***`, and pays the rewards.
8. Afterwards: a Repeatable quest can be accepted again (after its cooldown, if any). A quest that expired (**FAILED**) or was abandoned (**ABANDONED**) can be accepted again with `qaccept`, even if it is not Repeatable.

## Quick start

Goal: "Kill 5 sewer rats, then report back to the mayor." We use zone 30, quest ID 5 as example numbers; use your own zone and the next free ID.

1. Open **Dashboard > Quests** and click **Create New Quest**.
2. On the **Basic Info** tab fill in **Zone ID**, **Quest ID**, **Name** (for example `Rats in the Cellar`) and **Description** (this is what `questinfo` shows players). Set **Min Level** / **Max Level**.
3. Under **Quest Trigger Configuration** set **Trigger Type** to **Manual**. (Do not pick **Mob Encounter** expecting the mob to hand the quest out: the game ignores the Quest Giver Mob. See [Offering a quest](#offering-a-quest).)
4. Click **Create Quest**. The editor reloads on the saved quest.
5. Open the **Phases & Objectives** tab (it only works after the first save) and click **Add Phase**. Rename it `Clear the cellar`.
6. Click **Add Objective** and set:
   - type **Kill Mob**, count `5`, tick **Show Progress**;
   - **Player-visible description**: `Kill 5 sewer rats`;
   - target: search the rat mob in **Search target mob...**.
7. Add a second objective in the same phase: type **Talk to NPC**, count `1`, description `Report to the mayor`, target the mayor mob. Players complete it with `ask mayor hello` once the mayor is in the room. Keep both objectives in one phase: objectives in later phases can be finished early (see [Phases](#phases)), which would stall the quest.
8. Click **Add Reward** under **Phase Rewards**. Choose **Experience**, **Amount** `500`; add another with **Gold** `100`.
9. Make the quest discoverable. Attach a greeting or speech trigger to the mayor mob that tells players `Type qaccept 30 5 to take the job.`
10. Test it (see [Testing a quest](#testing-a-quest)): `qload 30 5`, kill five rats, `ask mayor hello`, then `quests`.

Basic Info and Requirements are saved with **Create Quest** / **Save Changes**. Phases, objectives and rewards are saved the moment you edit them.

## Concepts

### Offering a quest

The **Trigger Type** decides how a player is told about the quest. What the game actually does with each value:

| Trigger Type (label) | Value    | What the game does                                                                                                                                             |
| -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manual               | `MANUAL` | Nothing automatic. Staff assign it with `qload` / `qgive`; players can still `qaccept` it.                                                                     |
| Mob Encounter        | `MOB`    | **Nothing.** The Quest Giver Mob is not read by the game. Players take the quest with `qaccept <zone> <id>`. Have the mob tell them the command.               |
| Level Reached        | `LEVEL`  | When a character levels up to exactly **Trigger Level**, the quest is offered (or accepted, see below). Characters already past that level are not offered it. |
| Item Obtained        | `ITEM`   | Offered when a character picks up the **Trigger Item** with `get`.                                                                                             |
| Room Entered         | `ROOM`   | Offered when a character first enters the **Trigger Room** (see the VISIT_ROOM note under [Objectives](#objectives)).                                          |
| Skill Used           | `SKILL`  | Offered when a character successfully uses the **Trigger Ability**.                                                                                            |
| Event Active         | `EVENT`  | Offered to every player online when the game event is switched on (the server checks about once a minute). Players who log in later are not offered it.        |
| Auto-Start           | `AUTO`   | Offered (or accepted) at every login until the character holds the quest.                                                                                      |

For `LEVEL`, `ITEM`, `ROOM`, `SKILL`, `EVENT` and `AUTO`: if the quest's auto-accept flag is on, the character is put on the quest straight away; if it is off the character only sees `*** Quest available: <name> (<zone>, <id>) - type qaccept <zone> <id> to take it. ***`. The editor has no field for auto-accept yet, so today these types only **offer**. A trigger never re-offers a quest the character is already on or has completed.

Whatever the trigger type, any player can type `qaccept <zone> <id>` for any quest that is not Hidden.

**Hidden** quests cannot be accepted by players at all (not by `qaccept`, not by triggers). Only staff can hand them out with `qload` / `qgive`. Players can still read a hidden quest's definition with `questinfo <zone> <id>` if they know the numbers.

### Prerequisites and requirements

Checked when the quest is accepted:

- **Min Level / Max Level**: the character's level must be inside the range (a Max Level of 0 or less means no upper limit).
- **Prerequisites**: other quests the character must have **completed**. The game enforces every prerequisite row whose "require completion" flag is on. The editor has no screen for prerequisites yet (the quest list shows them); they are managed through the API.
- **Exclusive Group**: quests that share a group name are mutually exclusive. While a character holds any quest in the group with a status other than abandoned (in progress, completed or failed), the others refuse with "you already hold quest ... in exclusive group".

#### Availability requirement

The **Lua Expression** on the **Requirements** tab is evaluated only when a player types `qaccept`. It is not checked by trigger auto-accept, `qload` or `qgive`.

- The expression is wrapped as `return (<your expression>)` and `actor` is the player. Write an expression, not a script.
- Useful fields: `actor.level`, `actor.class` and `actor.race` (both **lower-case**: `'paladin'`, `'elf'`), `actor.name`. Useful methods: `actor:has_item(zone, id)`, `actor:has_skill(name)`, `actor:has_effect(name)`.
- Examples: `actor.class == 'paladin'`, `actor.race == 'elf' and actor.level >= 20`, `actor:has_item(30, 12)`.
- **It fails open.** A typo, a runtime error, or a result that is not a boolean lets the player through. The warning goes to the server log (`syslog`), never to the player. Always test the expression (see [Testing a quest](#testing-a-quest)).
- `character.class == 'WARRIOR'` (the placeholder text in the editor) does not work: there is no `character` variable and class names are lower-case.

### Phases

- Phases run in **Order**, lowest first (ties broken by phase ID). The editor numbers new phases in the order you add them and has no reordering control yet. In the in-game `quests` listing the number after "Phase" is that Order value, so the first phase shows as `Phase 0`.
- A phase finishes when **all** its objectives are complete (any order). Then the next phase becomes current. Finishing the last phase completes the quest.
- **Objectives are not gated by the current phase.** From the moment a quest is accepted, a matching action advances objectives in every phase. If a later phase's objectives are all finished early, the quest stalls when it reaches that phase: the server only checks whether a phase is done when an objective completes, and there is nothing left to complete. Design phases so that later-phase objectives cannot be done early, or put everything in one phase.
- The phase **Name** and **Phase Description** are shown to players in `quests`. A quest with no phases or no objectives can never complete by play.

### Objectives

Each objective has a type, a **Required Count**, **Show Progress**, a **Player-visible description** (shown in `quests` and in progress messages) and an **Internal note (builder only)** (shown only to Builder-or-higher viewers in `quests`).

| Editor label | Value          | Needs                                  | Player completes it by                                                                                                                                                                                 |
| ------------ | -------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Kill Mob     | `KILL_MOB`     | Target mob                             | Killing a mob of that prototype. Credit goes to the player who lands the kill; group members do not share it (the editor cannot set party scope yet). Each kill adds 1.                                |
| Collect Item | `COLLECT_ITEM` | Target object                          | Picking the item up with `get` (floor, container, `get all`). Each pickup adds 1: it counts pickups, not items currently held. Items bought, received with `give`, or rewarded do not count.           |
| Deliver Item | `DELIVER_ITEM` | Target object **and** a deliver-to mob | `give <item> <mob>` to a mob of that prototype. The item is not consumed by the objective itself. **The editor has no deliver-to field yet, so this type cannot be completed from editor-built data.** |
| Visit Room   | `VISIT_ROOM`   | Target room                            | Entering the room for the first time. It only counts the first time the character is recorded entering that room; a character who already walked through it may never complete the objective.          |
| Talk to NPC  | `TALK_TO_NPC`  | Target mob                             | `ask <mob> <anything>` with the mob in the room. Any topic counts; `say` does not. Optional dialogue adds a reply (see [Dialogue](#dialogue)).                                                         |
| Use Skill    | `USE_SKILL`    | Target ability                         | Successfully using that skill or spell (a failed attempt does not count). **The editor has no ability field for this type yet.**                                                                       |
| Custom (Lua) | `CUSTOM_LUA`   | A Lua expression                       | The server evaluates the expression about once a minute. See [Custom Lua](#custom-lua).                                                                                                                |

"Required Count" is capped: progress never exceeds it, and an objective completes when the count is reached. The target pickers store the **zone:id** of the mob, object or room prototype; double-check you picked the right one.

### Rewards

Rewards live on a phase in the editor, but the game pays **all of a quest's rewards when the quest completes**, whichever phase they were attached to. Put them on the last phase so the editor matches reality.

| Editor type | Value        | What the player gets                                                                         |
| ----------- | ------------ | -------------------------------------------------------------------------------------------- |
| Experience  | `EXPERIENCE` | **Amount** experience points.                                                                |
| Gold        | `GOLD`       | **Amount** gold.                                                                             |
| Item        | `ITEM`       | One copy of the item (quantity 1; the editor cannot set a quantity) placed in the inventory. |
| Ability     | `ABILITY`    | Teaches the ability (**Ability ID**) as known.                                               |

The game also understands Skill Points and Housing rewards, but the editor cannot create them. Housing is only announced, not granted.

**Choice Group**: rewards that share a group number are a "pick one" set. They are **not** paid at completion. The player must type `qreward` to list the choices and `qreward <zone> <id> <reward id>` to pick one. The completion message does not mention choice rewards, so tell players about `qreward` in your NPC dialogue or quest description.

Rewards with a condition (a Lua expression, same rules as the availability requirement) are also claimed with `qreward`; the editor cannot set conditions yet.

### Repeatable, cooldown and time limits

- **Repeatable** off: once COMPLETED the quest can never be accepted again by that character. On: it can be accepted again.
- **Cooldown** (minutes between completion and the next acceptance) is enforced by the game but the editor has no field for it yet.
- **Time Limit (minutes)** sets an expiry when the quest is accepted through `qaccept` or an auto-accept trigger. The server checks about once a minute and marks overdue quests FAILED with `*** Quest expired: ... ***`. Quests given with `qload` / `qgive` get no expiry.
- Abandoning (`abandon <#>`) or failing a quest never blocks it: the player can accept it again.
- **Known limitation:** accepting a quest again resets its phase and variables but keeps old objective counts. A repeated quest whose objectives were all finished last time starts with them already finished and cannot progress. Until this is fixed, test repeatables with care, and prefer one-shot quests.

### Dialogue

Dialogue is bound to a **Talk to NPC** objective: when the player does `ask <mob> <topic>` and the topic matches the dialogue's keywords (match types: exact, contains, starts with, any of, regex; all case-insensitive), the mob replies with the dialogue's message.

- Progress is not gated by the keywords: every `ask` of that mob advances the objective, matching or not.
- A dialogue can link a dialogue tree, but only the tree's root message is ever shown; the game does not walk the rest of the tree.
- The editor has no dialogue screen yet (the API can create them), and dialogue changes need a server restart.

### Quest variables

Scripts can keep per-player, per-quest values:

```lua
local q = actor:active_quest(30, 5)   -- zone, quest id; nil if actor is not a player
if q then
  q:setvar('read_tablet', true)
  local seen = q:getvar('read_tablet')
end
```

- Values are saved with the player's quest record (about every 10 seconds) and wiped when the quest is accepted again. Writes for a quest the player has no record of are lost.
- `getvar` reads the server's in-memory copy. Values saved before a server restart are not loaded back into it yet.
- Do not use the key `claimed_rewards`; the game uses it for `qreward`.
- Do not confuse these with the older script helpers `start_quest`, `advance_quest`, `complete_quest`, `get_quest_stage` and friends: those keep a flat note on the player and do **not** touch Quest, `quests`, objectives or rewards.
- `setvar` / `getvar` on a mob, object or room are different again: they are stored per prototype (shared by every copy), not per player.

### Custom Lua

A **Custom (Lua)** objective holds a Lua **expression**.

- About once a minute the server evaluates it for each online player who has the objective in progress. If it returns exactly `true`, the count goes up by 1; at Required Count the objective completes. Non-boolean results (a number, nil) count as false, and so do errors.
- `actor` and `self` are the player. The same fields and methods as the availability requirement are available. `quest_vars_json` is a **string** holding the quest's saved variables as compact JSON.
- Limits per evaluation: 5,000,000 Lua instructions and 50 ms of wall-clock time, whichever comes first. `os`, `io`, `debug`, `require`, `load` and `dofile` are removed.
- Because it is polled once a minute, use it for slow conditions, not for reacting to a single action.

Examples (the expression only):

```lua
actor.level >= 10 and actor:has_item(30, 12)
```

```lua
actor.hp == actor.max_hp
```

With Required Count `3` the second one means "be at full health at three separate checks".

```lua
quest_vars_json:find('"read_tablet":true', 1, true) ~= nil
```

## Testing a quest

Staff commands (Builder role or higher) in the game:

- `qload <zone> <id>`: put the quest on your own character, IN_PROGRESS, skipping every gate. It refuses if you already have any record of that quest, including completed or abandoned ones.
- `qgive <player> <zone> <id>`: the same for another online player.
- `quests`: your quests. Shows each phase (`>` current, a tick when done), each objective as `[done]`, `[n/total]` or `[ ]`, and, for staff, the internal notes.
- `questinfo <zone> <id>`: the definition. Staff also see time limit, cooldown, exclusive group and the availability expression.
- `qaccept <zone> <id>`: accept it the way a player would. This is the only way to test level, prerequisites, exclusive group, cooldown, time limit and the availability expression.
- `qcomplete <#>`: force-complete the quest in slot number `#` of `quests`. It does **not** pay rewards or run phases, so use it only to test what happens afterwards. To test rewards, finish the objectives for real.
- `abandon <#>`: drop a quest. `qreward`: list or claim choice and conditional rewards.
- `lua <code>`: run Lua as your character, for example `lua print(actor.class, actor.race, actor.level)` or `lua print(actor.level >= 10)`. Use it to check an expression before saving it.

Seeing errors:

- `syslog watch warn` shows warnings live. Failed availability, reward-condition and Custom Lua expressions are logged there (for example `CUSTOM_LUA eval failed`). Run `syslog 100 lua` to search recent lines for them.
- `scripterrors` lists failures from mob, object and room **trigger scripts**. It does not list quest expression errors.

Starting over: there is no in-game reset. `qload` will not replace an existing record, and a repeated `qaccept` keeps old objective counts (see the limitation above). The clean way is to test with a fresh character, or ask someone with database access to delete that character's row from the CharacterQuest table.

## Common mistakes

- **Expecting the Quest Giver Mob to hand out the quest.** The game ignores it. Tell players the `qaccept` command in the mob's dialogue or in the quest Description.
- **Hidden left on.** Players cannot accept hidden quests at all.
- **Availability expression typos.** They fail open, so everyone gets the quest. Use `actor`, not `character`, and lower-case class and race names.
- **Objectives in later phases that can be finished early.** The quest stalls on reaching that phase. Use one phase or make later objectives impossible to do early.
- **Deliver Item or Use Skill objectives.** The editor cannot set the recipient or ability yet, so these objectives never advance.
- **Talking with `say`.** Talk to NPC only counts `ask <mob> <topic>`.
- **Collect Item miscounts.** It counts pickups with `get`, not what the player holds, and not items bought or given.
- **Visit Room for a place the player has already been.** Only the first recorded entry counts.
- **Rewards on the first phase.** They are still paid only at completion. Attach them to the last phase to avoid confusion.
- **Choice rewards nobody can find.** Players must know about `qreward`.
- **Custom Lua returning a number or nil.** Only a real `true` counts. Compare, for example `actor.level >= 10`.
- **Forgetting to save.** Basic Info and Requirements need **Create Quest** / **Save Changes**. The Phases & Objectives tab is unavailable until the quest exists.

## Reference

### Basic Info tab

| Field                                                                           | Meaning                                                                                                         |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Zone ID, Quest ID                                                               | The quest's permanent identity `(zone, id)`. Fixed after creation. Players type these in `qaccept <zone> <id>`. |
| Name                                                                            | Display name; supports colour markup. Shown in `quests`.                                                        |
| Description                                                                     | Long text shown by `questinfo`.                                                                                 |
| Min Level, Max Level                                                            | Accept-time level range (see [Prerequisites and requirements](#prerequisites-and-requirements)).                |
| Repeatable                                                                      | Whether a completed quest can be accepted again.                                                                |
| Hidden                                                                          | Players cannot accept it; staff can still assign it.                                                            |
| Trigger Type                                                                    | How the quest is offered. See [Offering a quest](#offering-a-quest).                                            |
| Time Limit (minutes)                                                            | Expiry after acceptance; empty means none.                                                                      |
| Quest Giver Mob                                                                 | Stored but ignored by the game.                                                                                 |
| Trigger Level, Trigger Item, Trigger Room, Trigger Ability ID, Trigger Event ID | The target for the matching trigger type.                                                                       |
| Exclusive Group                                                                 | Quests sharing a name are mutually exclusive.                                                                   |

### Requirements tab

| Field          | Meaning                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| Lua Expression | The availability requirement; see [Prerequisites and requirements](#prerequisites-and-requirements). |

### Phases & Objectives tab

| Field                                  | Meaning                                                                                            |
| -------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Phase name                             | Shown in `quests`.                                                                                 |
| Phase Description                      | One-line blurb shown under the phase name in `quests`.                                             |
| Objective type                         | See [Objectives](#objectives).                                                                     |
| Count                                  | Required Count. At least 1.                                                                        |
| Show Progress                          | On: `[n/total]`; off: `[ ]` until done, and progress messages say only that the objective updated. |
| Player-visible description             | The text players see.                                                                              |
| Internal note (builder only)           | Visible to staff in `quests`.                                                                      |
| Target mob, target object, target room | The prototype to match.                                                                            |
| Lua expression                         | For Custom (Lua) only; see [Custom Lua](#custom-lua).                                              |
| Reward Type, Amount, Item, Ability ID  | See [Rewards](#rewards).                                                                           |
| Choice Group                           | Same number means pick one with `qreward`.                                                         |

### Player commands

| Command                                      | Use                                           |
| -------------------------------------------- | --------------------------------------------- |
| `quests` (also `qstat`, `qlist`, `questlog`) | List your quests and progress.                |
| `qaccept <zone> <id>`                        | Accept a quest.                               |
| `abandon <#>`                                | Drop an in-progress quest.                    |
| `questinfo <zone> <id>`                      | Read a quest's definition.                    |
| `qreward [<zone> <id> [<reward id>]]`        | List or claim choice and conditional rewards. |
| `ask <mob> <topic>`                          | Advances Talk to NPC objectives.              |
| `give <item> <mob>`                          | Advances Deliver Item objectives.             |

### What the editor cannot set yet

These exist in the database and the game, but have no editor control: prerequisites, auto-accept, cooldown, short description, share flag (the game ignores it), objective scope (solo or party), the Use Skill ability, the Deliver Item recipient, reward quantity, reward condition, Skill Points and Housing rewards, dialogue and dialogue trees, and phase ordering.
