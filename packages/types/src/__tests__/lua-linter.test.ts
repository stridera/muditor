import { describe, test, expect } from 'bun:test';
import { lintLua, lintLuaWithEntities } from '../lua-linter';
import type { EntityDatabase } from '../lua-linter/types';

// Helper to extract rule names from lint results
function rules(code: string): string[] {
  return lintLua(code).map(i => i.rule);
}

function firstIssue(code: string) {
  const issues = lintLua(code);
  expect(issues.length).toBeGreaterThan(0);
  return issues[0]!;
}

// ---------------------------------------------------------------------------
// Syntax errors
// ---------------------------------------------------------------------------

describe('syntax errors', () => {
  test('missing end', () => {
    const issue = firstIssue('if true then\n  echo("hi")\n');
    expect(issue.rule).toBe('syntax-error');
    expect(issue.severity).toBe('error');
  });

  test('unclosed string', () => {
    const issue = firstIssue('local x = "unclosed\n');
    expect(issue.rule).toBe('syntax-error');
  });

  test('unexpected token', () => {
    const issue = firstIssue('local = 5');
    expect(issue.rule).toBe('syntax-error');
  });

  test('valid code has no syntax error', () => {
    const issues = lintLua('local x = 5\necho(tostring(x))');
    expect(issues.filter(i => i.rule === 'syntax-error')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Undefined globals
// ---------------------------------------------------------------------------

describe('undefined globals', () => {
  test('unknown function', () => {
    expect(rules('unknown_func()')).toContain('undefined-global');
  });

  test('unknown namespace', () => {
    expect(rules('foo.bar()')).toContain('undefined-global');
  });

  test('known global function is clean', () => {
    const issues = lintLua('dice(2, 6)');
    expect(issues.filter(i => i.rule === 'undefined-global')).toHaveLength(0);
  });

  test('known context variables are clean', () => {
    const issues = lintLua('actor:send("hi")');
    expect(issues.filter(i => i.rule === 'undefined-global')).toHaveLength(0);
  });

  test('Lua builtins are clean', () => {
    const issues = lintLua(
      'local x = tostring(5)\nlocal y = type(x)\nprint(y)'
    );
    expect(issues.filter(i => i.rule === 'undefined-global')).toHaveLength(0);
  });

  test('Lua standard library access is clean', () => {
    const issues = lintLua('local s = string.format("%d", 5)');
    expect(issues.filter(i => i.rule === 'undefined-global')).toHaveLength(0);
  });

  test('namespace access is clean', () => {
    const issues = lintLua('world.find_player("test")');
    expect(issues.filter(i => i.rule === 'undefined-global')).toHaveLength(0);
  });

  test('enum access is clean', () => {
    const issues = lintLua('local p = Position.Standing');
    expect(issues.filter(i => i.rule === 'undefined-global')).toHaveLength(0);
  });

  test('local variable is clean', () => {
    const issues = lintLua('local x = 5\necho(tostring(x))');
    expect(issues.filter(i => i.rule === 'undefined-global')).toHaveLength(0);
  });

  test('globals table does not trigger', () => {
    const issues = lintLua('globals.my_var = 5\nlocal x = globals.my_var');
    expect(issues.filter(i => i.rule === 'undefined-global')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Unknown member
// ---------------------------------------------------------------------------

describe('unknown member', () => {
  test('unknown namespace method', () => {
    expect(rules('world.nonexistent()')).toContain('unknown-member');
  });

  test('unknown enum value', () => {
    expect(rules('local p = Position.Nonexistent')).toContain('unknown-member');
  });

  test('unknown actor method', () => {
    expect(rules('actor:nonexistent_method()')).toContain('unknown-member');
  });

  test('unknown actor property', () => {
    expect(rules('local x = actor.nonexistent_prop')).toContain(
      'unknown-member'
    );
  });

  test('known actor method is clean', () => {
    const issues = lintLua('actor:send("hi")');
    expect(issues.filter(i => i.rule === 'unknown-member')).toHaveLength(0);
  });

  test('known actor property is clean', () => {
    const issues = lintLua('local n = actor.name');
    expect(issues.filter(i => i.rule === 'unknown-member')).toHaveLength(0);
  });

  test('known room method is clean', () => {
    const issues = lintLua('room:send("hi")');
    expect(issues.filter(i => i.rule === 'unknown-member')).toHaveLength(0);
  });

  test('unknown local base is not flagged', () => {
    const issues = lintLua('local x = get_room(1, 1)\nlocal y = x.whatever');
    expect(issues.filter(i => i.rule === 'unknown-member')).toHaveLength(0);
  });

  test('unknown Lua library member', () => {
    expect(rules('string.nonexistent()')).toContain('unknown-member');
  });

  test('known math member is clean', () => {
    const issues = lintLua('local x = math.floor(1.5)');
    expect(issues.filter(i => i.rule === 'unknown-member')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// DG Script remnants
// ---------------------------------------------------------------------------

describe('DG remnants', () => {
  test('percent variable', () => {
    const issue = firstIssue('echo(%actor.name%)');
    expect(issue.rule).toBe('dg-percent-var');
    expect(issue.severity).toBe('error');
  });

  test('vnum access', () => {
    expect(rules('local x = self.vnum')).toContain('dg-vnum-access');
  });

  test('time.stamp', () => {
    expect(rules('local t = time.stamp')).toContain('dg-time-stamp');
  });

  test('legacy function names', () => {
    expect(rules('dg_cast("fireball")')).toContain('dg-legacy-function');
  });

  test('DG patterns in strings are not flagged', () => {
    const issues = lintLua('echo("the %actor.name% pattern")');
    expect(issues.filter(i => i.rule === 'dg-percent-var')).toHaveLength(0);
  });

  test('DG patterns in comments are not flagged', () => {
    const issues = lintLua('-- old pattern: %actor.name%\necho("hi")');
    expect(issues.filter(i => i.rule === 'dg-percent-var')).toHaveLength(0);
  });

  test('vnum in string is not flagged', () => {
    const issues = lintLua('echo("mob.vnum is gone")');
    expect(issues.filter(i => i.rule === 'dg-vnum-access')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Variable shadowing
// ---------------------------------------------------------------------------

describe('variable shadowing', () => {
  test('shadow in loop', () => {
    const code = `
local count = 0
while count < 10 do
  local count = count + 1
end`;
    const issues = lintLua(code);
    const shadowIssues = issues.filter(i => i.rule === 'shadow-in-loop');
    expect(shadowIssues).toHaveLength(1);
    expect(shadowIssues[0]!.severity).toBe('error');
  });

  test('shadow loop condition', () => {
    const code = `
local x = 10
while x > 0 do
  if true then
    local x = 5
  end
end`;
    expect(rules(code)).toContain('shadow-loop-condition');
  });

  test('no shadow outside loop', () => {
    const code = `
local x = 5
if true then
  local x = 10
  echo(tostring(x))
end`;
    const issues = lintLua(code);
    expect(issues.filter(i => i.rule === 'shadow-in-loop')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// While true no wait
// ---------------------------------------------------------------------------

describe('while-true-no-wait', () => {
  test('while true without wait', () => {
    const code = `
while true do
  echo("infinite")
end`;
    expect(rules(code)).toContain('while-true-no-wait');
  });

  test('while true with wait is clean', () => {
    const code = `
while true do
  echo("ok")
  wait(1)
end`;
    const issues = lintLua(code);
    expect(issues.filter(i => i.rule === 'while-true-no-wait')).toHaveLength(0);
  });

  test('while true with nested wait is clean', () => {
    const code = `
while true do
  if true then
    wait(1)
  end
end`;
    const issues = lintLua(code);
    expect(issues.filter(i => i.rule === 'while-true-no-wait')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Condition var never modified
// ---------------------------------------------------------------------------

describe('condition-var-never-modified', () => {
  test('condition var never assigned', () => {
    const code = `
local x = 10
while x > 0 do
  echo("looping")
end`;
    expect(rules(code)).toContain('condition-var-never-modified');
  });

  test('condition var assigned is clean', () => {
    const code = `
local x = 10
while x > 0 do
  x = x - 1
end`;
    const issues = lintLua(code);
    expect(
      issues.filter(i => i.rule === 'condition-var-never-modified')
    ).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Unused variables
// ---------------------------------------------------------------------------

describe('unused variables', () => {
  test('unused local', () => {
    expect(rules('local x = 5')).toContain('unused-variable');
  });

  test('used local is clean', () => {
    const issues = lintLua('local x = 5\necho(tostring(x))');
    expect(issues.filter(i => i.rule === 'unused-variable')).toHaveLength(0);
  });

  test('underscore prefix not flagged', () => {
    const issues = lintLua('local _unused = 5');
    expect(issues.filter(i => i.rule === 'unused-variable')).toHaveLength(0);
  });

  test('for loop iterator not flagged', () => {
    const code = `
for i = 1, 10 do
  echo("hi")
end`;
    const issues = lintLua(code);
    expect(issues.filter(i => i.rule === 'unused-variable')).toHaveLength(0);
  });

  test('generic for variables not flagged', () => {
    const code = `
local t = {1, 2, 3}
for k, v in pairs(t) do
  echo(tostring(v))
end`;
    const issues = lintLua(code);
    // k might be unused but it's a for-loop variable
    expect(
      issues.filter(
        i => i.rule === 'unused-variable' && i.message.includes('`k`')
      )
    ).toHaveLength(0);
  });

  test('function parameters are not flagged', () => {
    const code = `
local function helper(a, b)
  return a
end
helper(1, 2)`;
    const issues = lintLua(code);
    expect(
      issues.filter(
        i => i.rule === 'unused-variable' && i.message.includes('`b`')
      )
    ).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Entity validation
// ---------------------------------------------------------------------------

describe('entity validation', () => {
  const entities: EntityDatabase = {
    rooms: new Set(['30:1', '30:2', '100:5']),
    mobs: new Set(['30:10', '30:11']),
    objects: new Set(['30:20', '30:21']),
  };

  test('valid room reference', () => {
    const issues = lintLuaWithEntities('get_room(30, 1)', entities);
    expect(issues.filter(i => i.rule === 'entity-not-found')).toHaveLength(0);
  });

  test('invalid room reference', () => {
    const issues = lintLuaWithEntities('get_room(999, 99)', entities);
    expect(issues.filter(i => i.rule === 'entity-not-found')).toHaveLength(1);
    expect(issues[0]!.message).toContain('room');
    expect(issues[0]!.message).toContain('999:99');
  });

  test('valid mob spawn', () => {
    const issues = lintLuaWithEntities('room:spawn_mobile(30, 10)', entities);
    expect(issues.filter(i => i.rule === 'entity-not-found')).toHaveLength(0);
  });

  test('invalid mob spawn', () => {
    const issues = lintLuaWithEntities('room:spawn_mobile(30, 99)', entities);
    expect(issues.filter(i => i.rule === 'entity-not-found')).toHaveLength(1);
  });

  test('valid object spawn', () => {
    const issues = lintLuaWithEntities('actor:spawn_object(30, 20)', entities);
    expect(issues.filter(i => i.rule === 'entity-not-found')).toHaveLength(0);
  });

  test('invalid object reference', () => {
    const issues = lintLuaWithEntities('actor:has_item_id(30, 99)', entities);
    expect(issues.filter(i => i.rule === 'entity-not-found')).toHaveLength(1);
  });

  test('namespace entity check', () => {
    const issues = lintLuaWithEntities('world.count_mobiles(30, 99)', entities);
    expect(issues.filter(i => i.rule === 'entity-not-found')).toHaveLength(1);
  });

  test('template check', () => {
    const issues = lintLuaWithEntities('objects.template(30, 20)', entities);
    expect(issues.filter(i => i.rule === 'entity-not-found')).toHaveLength(0);
  });

  test('variable arguments are not checked', () => {
    const issues = lintLuaWithEntities(
      'local z = 30\nlocal id = 99\nget_room(z, id)',
      entities
    );
    expect(issues.filter(i => i.rule === 'entity-not-found')).toHaveLength(0);
  });

  test('parse error returns empty', () => {
    const issues = lintLuaWithEntities('if then end broken', entities);
    expect(issues).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Real trigger files — no false positives
// ---------------------------------------------------------------------------

describe('real trigger code', () => {
  test('clean trigger: room exit setup', () => {
    const code = `local south = get_room(390, 187):exit("south")
if south then
    south:set_state({has_door = true, closed = true, description = "A sturdy gate holds back the sea."})
end`;
    const issues = lintLua(code);
    // Should have no errors (south is a local, methods are valid)
    expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
  });

  test('typical mob greeting', () => {
    const code = `if not actor.is_npc then
  self:say("Welcome, " .. actor.display_name .. "!")
  wait(1)
  self:emote("bows gracefully.")
end`;
    const issues = lintLua(code);
    expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
  });

  test('quest interaction', () => {
    const code = `if actor:get_quest_stage("rescue") == 1 then
  self:say("You found the prisoner! Here is your reward.")
  actor:give_wealth(500)
  actor:advance_quest("rescue")
  actor:spawn_object(30, 45)
end`;
    const issues = lintLua(code);
    expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
  });

  test('combat trigger with effects', () => {
    const code = `if percent_chance(25) then
  effects.apply(actor, "slow", {duration = 30})
  self.room:send(self.display_name .. " casts a slowing spell!")
end`;
    const issues = lintLua(code);
    expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
  });

  test('timer-based patrol', () => {
    const code = `local directions = {"north", "east", "south", "west"}
local idx = vars.get(self, "patrol_idx") or 1
self:move(directions[idx])
idx = idx + 1
if idx > #directions then
  idx = 1
end
vars.set(self, "patrol_idx", idx)`;
    const issues = lintLua(code);
    expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
  });

  test('speech trigger with keyword matching', () => {
    const code = `local speech_lower = string.lower(speech)
if string.find(speech_lower, "help") then
  self:say("I can help you with that!")
elseif string.find(speech_lower, "quest") then
  self:say("I have a task for you.")
end`;
    const issues = lintLua(code);
    expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
  });

  test('world trigger with zone operations', () => {
    const code = `local count = world.count_mobiles(30, 5)
if count < 3 then
  local r = get_room(30, 10)
  if r then
    r:spawn_mobile(30, 5)
    zone.echo(30, "A new guard appears at the gate.")
  end
end`;
    const issues = lintLua(code);
    expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Issue format
// ---------------------------------------------------------------------------

describe('issue format', () => {
  test('issues have all required fields', () => {
    const issues = lintLua('unknown_func()');
    expect(issues.length).toBeGreaterThan(0);
    const issue = issues[0]!;
    expect(typeof issue.line).toBe('number');
    expect(typeof issue.column).toBe('number');
    expect(typeof issue.endColumn).toBe('number');
    expect(typeof issue.severity).toBe('string');
    expect(typeof issue.message).toBe('string');
    expect(typeof issue.rule).toBe('string');
  });

  test('issues are sorted by line and column', () => {
    const code = `unknown1()
unknown2()`;
    const issues = lintLua(code);
    for (let i = 1; i < issues.length; i++) {
      const prev = issues[i - 1]!;
      const curr = issues[i]!;
      expect(
        prev.line < curr.line ||
          (prev.line === curr.line && prev.column <= curr.column)
      ).toBe(true);
    }
  });
});
