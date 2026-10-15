/**
 * Selector for DOM that owns keyboard input: Monaco's hidden textarea lives
 * inside `.monaco-editor`; Blockly renders its inline field editors into
 * `.blocklyWidgetDiv`.
 */
const EDITOR_WIDGET_SELECTOR =
  '.monaco-editor, .blocklyWidgetDiv, [contenteditable="true"], [contenteditable=""]';

/**
 * True when a key event originates from somewhere the user is typing
 * (input, textarea, select, contenteditable, Monaco, Blockly widget).
 * Single-key global shortcuts (`?`, `/`, `e`, WASD...) must ignore these
 * events so the character is inserted instead of triggering the shortcut.
 */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof (target as Element).tagName !== 'string') return false;
  const el = target as HTMLElement;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  return (
    typeof el.closest === 'function' && !!el.closest(EDITOR_WIDGET_SELECTOR)
  );
}
