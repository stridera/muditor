// Limits mirror apps/api SettingsService.updateCommandHelp.
export const SUMMARY_MAX = 200;
export const TEXT_MAX = 8000;

export interface HelpFormData {
  helpSummary: string;
  helpText: string;
}

/** Returns an error message, or null when the form is valid. */
export function validateHelpForm(form: HelpFormData): string | null {
  const summary = form.helpSummary.trim();
  if (/[\r\n]/.test(summary)) return 'Summary must be a single line';
  if (summary.length > SUMMARY_MAX) {
    return `Summary must be at most ${SUMMARY_MAX} characters`;
  }
  if (form.helpText.trim().length > TEXT_MAX) {
    return `Help text must be at most ${TEXT_MAX} characters`;
  }
  return null;
}

/** Empty (after trimming) is sent as null so the game uses its built-in text. */
export function toMutationVars(form: HelpFormData) {
  return {
    helpSummary: form.helpSummary.trim() || null,
    helpText: form.helpText.trim() || null,
  };
}

export function matchesQuery(
  cmd: { name: string; aliases: string[]; helpSummary?: string | null },
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    cmd.name.toLowerCase().includes(q) ||
    cmd.aliases.some(a => a.toLowerCase().includes(q)) ||
    (cmd.helpSummary ?? '').toLowerCase().includes(q)
  );
}
