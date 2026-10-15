/**
 * @jest-environment jsdom
 */
import { act, fireEvent, renderHook } from '@testing-library/react';
import {
  confirmDiscardIf,
  confirmUnsavedNavigation,
  useDirtyBaseline,
  useDirtyWhileOpen,
  useEscapeToClose,
  useGuardedDialog,
  useUnsavedChangesGuard,
} from '../use-unsaved-changes-guard';

let confirmSpy: jest.SpyInstance;

beforeEach(() => {
  confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
});

afterEach(() => {
  confirmSpy.mockRestore();
  document.body.innerHTML = '';
});

function beforeUnload(): Event {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

function addLink(href: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = 'go';
  document.body.appendChild(link);
  return link;
}

describe('useUnsavedChangesGuard', () => {
  it('does nothing while clean', () => {
    renderHook(() => useUnsavedChangesGuard(false));
    expect(beforeUnload().defaultPrevented).toBe(false);
    const link = addLink('/dashboard/mobs');
    expect(fireEvent.click(link)).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(confirmUnsavedNavigation()).toBe(true);
  });

  it('asks the browser to confirm a reload / tab close while dirty', () => {
    const { rerender, unmount } = renderHook(
      ({ dirty }) => useUnsavedChangesGuard(dirty),
      { initialProps: { dirty: true } }
    );
    expect(beforeUnload().defaultPrevented).toBe(true);
    rerender({ dirty: false });
    expect(beforeUnload().defaultPrevented).toBe(false);
    rerender({ dirty: true });
    unmount();
    expect(beforeUnload().defaultPrevented).toBe(false);
  });

  it('blocks an in-app link click unless the user agrees', () => {
    renderHook(() => useUnsavedChangesGuard(true));
    const link = addLink('/dashboard/mobs');

    confirmSpy.mockReturnValue(false);
    expect(fireEvent.click(link)).toBe(false);
    expect(confirmSpy).toHaveBeenCalledTimes(1);

    confirmSpy.mockReturnValue(true);
    expect(fireEvent.click(link)).toBe(true);
    expect(confirmSpy).toHaveBeenCalledTimes(2);
  });

  it('lets new-tab clicks, same-page and off-site links through', () => {
    renderHook(() => useUnsavedChangesGuard(true));
    const link = addLink('/dashboard/mobs');
    expect(fireEvent.click(link, { ctrlKey: true })).toBe(true);
    expect(fireEvent.click(addLink(window.location.pathname + '#top'))).toBe(
      true
    );
    const blank = addLink('/dashboard/objects');
    blank.target = '_blank';
    expect(fireEvent.click(blank)).toBe(true);
    // Off-site navigation unloads the page, so beforeunload covers it.
    expect(fireEvent.click(addLink('https://example.com/'))).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('confirmDiscard asks only when dirty', () => {
    const clean = renderHook(() => useUnsavedChangesGuard(false));
    expect(clean.result.current.confirmDiscard()).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();

    const dirty = renderHook(() => useUnsavedChangesGuard(true, 'Sure?'));
    expect(dirty.result.current.confirmDiscard()).toBe(false);
    expect(confirmSpy).toHaveBeenCalledWith('Sure?');
    confirmSpy.mockReturnValue(true);
    expect(dirty.result.current.confirmDiscard()).toBe(true);
  });

  it('guard() runs the action only when the user agrees', () => {
    const { result } = renderHook(() => useUnsavedChangesGuard(true));
    const action = jest.fn();
    const guarded = result.current.guard(action);
    guarded();
    expect(action).not.toHaveBeenCalled();
    confirmSpy.mockReturnValue(true);
    guarded();
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('disarm() stops guarding at once, before any re-render', () => {
    const { result } = renderHook(() => useUnsavedChangesGuard(true));
    expect(beforeUnload().defaultPrevented).toBe(true);
    act(() => {
      result.current.disarm();
      // A redirect issued in the same tick must not be prompted.
      expect(beforeUnload().defaultPrevented).toBe(false);
    });
    expect(beforeUnload().defaultPrevented).toBe(false);
  });

  it('one prompt for two dirty editors', () => {
    renderHook(() => useUnsavedChangesGuard(true));
    renderHook(() => useUnsavedChangesGuard(true));
    const link = addLink('/dashboard/mobs');
    fireEvent.click(link);
    expect(confirmSpy).toHaveBeenCalledTimes(1);
  });

  it('the Back button asks, and stays put when declined', () => {
    renderHook(() => useUnsavedChangesGuard(true));
    const pushState = jest.spyOn(window.history, 'pushState');
    confirmSpy.mockReturnValue(false);
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    // The sentinel entry is restored so the next Back asks again.
    expect(pushState).toHaveBeenCalled();
    pushState.mockRestore();
  });
});

describe('confirmDiscardIf', () => {
  it('only asks when dirty', () => {
    expect(confirmDiscardIf(false)).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(confirmDiscardIf(true, 'Really?')).toBe(false);
    expect(confirmSpy).toHaveBeenCalledWith('Really?');
  });
});

describe('useDirtyBaseline', () => {
  it('is clean right after load and dirty after an edit', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDirtyBaseline(value),
      { initialProps: { value: { name: '', tags: [] as string[] } } }
    );
    expect(result.current.isDirty).toBe(false);

    // Server data arrives: form and baseline are set together.
    const loaded = { name: 'Goblin', tags: ['a'] };
    act(() => result.current.setBaseline(loaded));
    rerender({ value: loaded });
    expect(result.current.isDirty).toBe(false);

    // A structurally equal copy is not an edit.
    rerender({ value: { name: 'Goblin', tags: ['a'] } });
    expect(result.current.isDirty).toBe(false);

    rerender({ value: { name: 'Goblin King', tags: ['a'] } });
    expect(result.current.isDirty).toBe(true);

    rerender({ value: { name: 'Goblin', tags: ['a', 'b'] } });
    expect(result.current.isDirty).toBe(true);

    // Saving re-baselines.
    const saved = { name: 'Goblin', tags: ['a', 'b'] };
    act(() => result.current.setBaseline(saved));
    expect(result.current.isDirty).toBe(false);
  });
});

describe('useDirtyWhileOpen / useGuardedDialog', () => {
  it('snapshots the form when the dialog opens', () => {
    const { result, rerender } = renderHook(
      ({ open, form }) => useDirtyWhileOpen(open, form),
      { initialProps: { open: false, form: { name: 'old' } } }
    );
    expect(result.current).toBe(false);
    // The opener fills the form and opens in one batch: that is the baseline.
    rerender({ open: true, form: { name: 'Elf' } });
    expect(result.current).toBe(false);
    rerender({ open: true, form: { name: 'Elf the Great' } });
    expect(result.current).toBe(true);
    rerender({ open: false, form: { name: 'Elf the Great' } });
    expect(result.current).toBe(false);
    rerender({ open: true, form: { name: 'Dwarf' } });
    expect(result.current).toBe(false);
  });

  it('dismissing a dirty dialog asks first', () => {
    const onOpenChange = jest.fn();
    const { result, rerender } = renderHook(
      ({ open, form }) =>
        useGuardedDialog(open, form, onOpenChange, 'Discard race?'),
      { initialProps: { open: true, form: { name: 'Elf' } } }
    );
    result.current(false);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(confirmSpy).not.toHaveBeenCalled();

    onOpenChange.mockClear();
    rerender({ open: true, form: { name: 'Elf!' } });
    result.current(false);
    expect(confirmSpy).toHaveBeenCalledWith('Discard race?');
    expect(onOpenChange).not.toHaveBeenCalled();

    confirmSpy.mockReturnValue(true);
    result.current(false);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    // Opening never prompts.
    confirmSpy.mockClear();
    result.current(true);
    expect(confirmSpy).not.toHaveBeenCalled();
  });
});

describe('useEscapeToClose', () => {
  it('closes on Escape from the page', () => {
    const onEscape = jest.fn();
    renderHook(() => useEscapeToClose(onEscape));
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('ignores other keys, and does nothing when disabled', () => {
    const onEscape = jest.fn();
    const { rerender } = renderHook(
      ({ enabled }) => useEscapeToClose(onEscape, enabled),
      { initialProps: { enabled: true } }
    );
    fireEvent.keyDown(document.body, { key: 'a' });
    expect(onEscape).not.toHaveBeenCalled();
    rerender({ enabled: false });
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onEscape).not.toHaveBeenCalled();
  });

  it('never closes while focus is inside Monaco (vim users)', () => {
    const onEscape = jest.fn();
    renderHook(() => useEscapeToClose(onEscape));
    const monaco = document.createElement('div');
    monaco.className = 'monaco-editor';
    const inner = document.createElement('textarea');
    monaco.appendChild(inner);
    document.body.appendChild(monaco);
    fireEvent.keyDown(inner, { key: 'Escape' });
    expect(onEscape).not.toHaveBeenCalled();
  });

  it('leaves Escape to an open dropdown', () => {
    const onEscape = jest.fn();
    renderHook(() => useEscapeToClose(onEscape));
    const list = document.createElement('div');
    list.setAttribute('role', 'listbox');
    const option = document.createElement('div');
    list.appendChild(option);
    document.body.appendChild(list);
    fireEvent.keyDown(option, { key: 'Escape' });
    expect(onEscape).not.toHaveBeenCalled();
  });
});
