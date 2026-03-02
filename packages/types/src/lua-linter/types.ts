export type LuaLintSeverity = 'error' | 'warning';

export interface LuaLintIssue {
  line: number; // 1-based line number
  column: number; // 1-based column
  endColumn: number; // 1-based end column
  severity: LuaLintSeverity;
  message: string;
  rule: string;
}

/**
 * Entity database for validating entity references in Lua scripts.
 * Keys are `"zoneId:localId"` strings.
 */
export interface EntityDatabase {
  rooms: Set<string>;
  mobs: Set<string>;
  objects: Set<string>;
}
