/** One AI rule as shown in lists (class and per-mob rules share this shape). */
export interface AiRuleRow {
  /** Stable React key: the rule id. */
  id: number;
  abilityId: number;
  abilityName: string;
  abilityType: string;
  priority: number;
  chancePct: number;
  cooldownS: number;
  /** Stored conditions JSON, untouched. */
  conditions: unknown;
  /** Stored selector; null means AUTO (per-mob rules only). */
  target: string | null;
  /** Class rules only. */
  minLevel?: number | null;
  enabled: boolean;
}

/** What the rule dialog hands back on submit. */
export interface AiRuleValues {
  abilityId: number;
  chancePct: number;
  cooldownS: number;
  /** Merged conditions (null = no conditions). */
  conditions: Record<string, unknown> | null;
  /** Canonical selector, `AUTO` included. */
  target: string;
  /** null = no level gate. Ignored for per-mob rules. */
  minLevel: number | null;
  enabled: boolean;
}
