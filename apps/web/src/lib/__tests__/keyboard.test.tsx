import { act, renderHook } from '@testing-library/react';
import { useHelpModal } from '@/components/HelpModal';
import { isEditableTarget } from '@/lib/keyboard';

function el(html: string): HTMLElement {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.appendChild(host);
  return host;
}

describe('isEditableTarget', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('treats form fields as editable', () => {
    const host = el(
      '<input id="a"/><textarea id="b"></textarea><select id="c"></select>'
    );
    for (const id of ['a', 'b', 'c']) {
      expect(isEditableTarget(host.querySelector(`#${id}`))).toBe(true);
    }
  });

  it('treats Monaco, Blockly widget and contenteditable DOM as editable', () => {
    const host = el(
      '<div class="monaco-editor"><div class="inputarea-wrap"><textarea id="m"></textarea><span id="v"></span></div></div>' +
        '<div class="blocklyWidgetDiv"><div id="bw"></div></div>' +
        '<div contenteditable="true"><b id="ce"></b></div>'
    );
    expect(isEditableTarget(host.querySelector('#m'))).toBe(true);
    expect(isEditableTarget(host.querySelector('#v'))).toBe(true);
    expect(isEditableTarget(host.querySelector('#bw'))).toBe(true);
    expect(isEditableTarget(host.querySelector('#ce'))).toBe(true);
  });

  it('treats ordinary elements, body and null as not editable', () => {
    const host = el('<div id="d"><button id="b">x</button></div>');
    expect(isEditableTarget(host.querySelector('#d'))).toBe(false);
    expect(isEditableTarget(host.querySelector('#b'))).toBe(false);
    expect(isEditableTarget(document.body)).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
  });
});

describe('useHelpModal "?" shortcut', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  function press(target: Element): KeyboardEvent {
    const ev = new KeyboardEvent('keydown', {
      key: '?',
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      target.dispatchEvent(ev);
    });
    return ev;
  }

  it('does not open help or swallow "?" typed in an input', () => {
    const { result } = renderHook(() => useHelpModal('global'));
    const host = el('<input id="i"/>');
    const ev = press(host.querySelector('#i')!);
    expect(result.current.open).toBe(false);
    expect(ev.defaultPrevented).toBe(false);
  });

  it('does not open help for the Monaco hidden textarea', () => {
    const { result } = renderHook(() => useHelpModal('global'));
    const host = el(
      '<div class="monaco-editor"><textarea id="t"></textarea></div>'
    );
    const ev = press(host.querySelector('#t')!);
    expect(result.current.open).toBe(false);
    expect(ev.defaultPrevented).toBe(false);
  });

  it('does not open help from a Blockly widget', () => {
    const { result } = renderHook(() => useHelpModal('global'));
    const host = el('<div class="blocklyWidgetDiv"><span id="s"></span></div>');
    press(host.querySelector('#s')!);
    expect(result.current.open).toBe(false);
  });

  it('still opens help from the page body', () => {
    const { result } = renderHook(() => useHelpModal('global'));
    const ev = press(document.body);
    expect(result.current.open).toBe(true);
    expect(ev.defaultPrevented).toBe(true);
  });
});
