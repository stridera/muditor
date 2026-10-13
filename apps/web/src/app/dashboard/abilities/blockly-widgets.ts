/**
 * Blockly renders its field editors, dropdowns, tooltips and context menus
 * into <body>, outside any dialog. Clicks and key presses inside them must
 * not dismiss the dialog that hosts the effect editor.
 */
const BLOCKLY_WIDGET_SELECTOR =
  '.blocklyWidgetDiv, .blocklyDropDownDiv, .blocklyTooltipDiv, .blocklyContextMenu';

export function isInsideBlocklyWidget(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest(BLOCKLY_WIDGET_SELECTOR);
}
