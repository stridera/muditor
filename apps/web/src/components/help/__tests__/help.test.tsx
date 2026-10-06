import { act, fireEvent, render, screen, within } from '@testing-library/react';

import { HelpButton } from '../HelpButton';
import { HELP_WIDTH_STORAGE_KEY } from '../HelpPanel';
import { HelpPanelProvider, HelpPanelSlot } from '../HelpPanelProvider';
import { QUESTS_HELP_ANCHORS } from '../help-topics';

function mockMatchMedia(matches: boolean) {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
    onchange: null,
  })) as unknown as typeof window.matchMedia;
}

/** Mirrors the dashboard layout: content and panel as flex siblings. */
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <HelpPanelProvider>
      <div style={{ display: 'flex' }}>
        <main>{children}</main>
        <HelpPanelSlot />
      </div>
    </HelpPanelProvider>
  );
}

describe('HelpButton + docked HelpPanel (quests topic)', () => {
  let scrollIntoView: jest.Mock;

  beforeEach(() => {
    // jsdom does not implement scrollIntoView.
    scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    window.localStorage.clear();
    mockMatchMedia(true);
    // jsdom has no PointerEvent; MouseEvent carries clientX for the drag test.
    if (!('PointerEvent' in window)) {
      Object.defineProperty(window, 'PointerEvent', {
        value: class extends MouseEvent {},
        configurable: true,
      });
    }
    Object.defineProperty(window, 'innerWidth', {
      value: 1600,
      configurable: true,
    });
  });

  it('opens the panel and renders the quests guide headings', () => {
    render(
      <Layout>
        <HelpButton topic='quests' />
      </Layout>
    );

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^help$/i }));

    const panel = screen.getByRole('complementary', { name: 'Help' });
    expect(
      within(panel).getByRole('heading', { name: 'Quest builder guide' })
    ).toBeInTheDocument();
    for (const heading of [
      'Overview',
      'Quick start',
      'Concepts',
      'Testing a quest',
      'Common mistakes',
      'Reference',
    ]) {
      expect(
        within(panel).getByRole('heading', { name: heading })
      ).toBeInTheDocument();
    }
  });

  it('is non-modal: no dialog, overlay or aria-hidden page content', () => {
    const { container } = render(
      <Layout>
        <HelpButton topic='quests' />
      </Layout>
    );
    fireEvent.click(screen.getByRole('button', { name: /^help$/i }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(container.querySelector('[data-state]')).toBeNull();
    expect(container.querySelector('[aria-modal]')).toBeNull();
    expect(container.querySelector('[data-aria-hidden]')).toBeNull();
    expect(container.querySelector('.fixed')).toBeNull();
    expect(document.body.style.pointerEvents).not.toBe('none');
    expect(document.body.getAttribute('data-scroll-locked')).toBeNull();
    // The page is a sibling of the panel, not covered by it.
    expect(screen.getByRole('main').nextElementSibling).toBe(
      screen.getByRole('complementary')
    );
  });

  it('keeps inputs outside the panel focusable and typeable', () => {
    render(
      <Layout>
        <input aria-label='Quest name' />
        <HelpButton topic='quests' />
      </Layout>
    );
    fireEvent.click(screen.getByRole('button', { name: /^help$/i }));

    const input = screen.getByLabelText('Quest name') as HTMLInputElement;
    act(() => input.focus());
    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: 'Rat hunt' } });
    expect(input.value).toBe('Rat hunt');
    // The panel is still there; typing did not close it.
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('scrolls to and focuses the section named by anchor', () => {
    render(
      <Layout>
        <HelpButton
          topic='quests'
          anchor={QUESTS_HELP_ANCHORS.objectives}
          variant='icon'
          tip='Objective types'
        />
      </Layout>
    );

    fireEvent.click(screen.getByRole('button', { name: /objective types/i }));

    const heading = within(screen.getByRole('complementary')).getByRole(
      'heading',
      { name: 'Objectives' }
    );
    expect(heading).toHaveAttribute('id', 'help-objectives');
    expect(scrollIntoView.mock.instances).toContain(heading);
    expect(heading).toHaveFocus();
  });

  it('just scrolls when another ? is clicked while open', () => {
    render(
      <Layout>
        <HelpButton
          topic='quests'
          anchor={QUESTS_HELP_ANCHORS.objectives}
          variant='icon'
          tip='Objective types'
        />
        <HelpButton
          topic='quests'
          anchor={QUESTS_HELP_ANCHORS.rewards}
          variant='icon'
          tip='Reward types'
        />
      </Layout>
    );
    fireEvent.click(screen.getByRole('button', { name: /objective types/i }));
    fireEvent.click(screen.getByRole('button', { name: /reward types/i }));

    expect(screen.getAllByRole('complementary')).toHaveLength(1);
    const rewards = within(screen.getByRole('complementary')).getByRole(
      'heading',
      { name: 'Rewards' }
    );
    expect(scrollIntoView.mock.instances).toContain(rewards);
    expect(rewards).toHaveFocus();
  });

  it('opens at the top of the guide when no anchor is given', () => {
    render(
      <Layout>
        <HelpButton topic='quests' />
      </Layout>
    );
    fireEvent.click(screen.getByRole('button', { name: /^help$/i }));

    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(screen.getByTestId('help-scroll')).toHaveFocus();
  });

  it('follows in-guide links by scrolling the panel, not the page', () => {
    render(
      <Layout>
        <HelpButton topic='quests' />
      </Layout>
    );
    fireEvent.click(screen.getByRole('button', { name: /^help$/i }));
    scrollIntoView.mockClear();

    const panel = screen.getByRole('complementary');
    const [link] = within(panel).getAllByRole('link', {
      name: 'Offering a quest',
    });
    fireEvent.click(link!);

    const target = within(panel).getByRole('heading', {
      name: 'Offering a quest',
    });
    expect(scrollIntoView.mock.instances).toContain(target);
    expect(target).toHaveFocus();
  });

  it('toggles from the Help button, closes with the X button and Esc, and restores focus', () => {
    render(
      <Layout>
        <HelpButton topic='quests' />
      </Layout>
    );
    const trigger = screen.getByRole('button', { name: /^help$/i });

    fireEvent.click(trigger);
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: 'Close help' }));
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByTestId('help-scroll'), { key: 'Escape' });
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('does not close on Esc pressed outside the panel', () => {
    render(
      <Layout>
        <input aria-label='Quest name' />
        <HelpButton topic='quests' />
      </Layout>
    );
    fireEvent.click(screen.getByRole('button', { name: /^help$/i }));
    fireEvent.keyDown(screen.getByLabelText('Quest name'), { key: 'Escape' });
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('does not bubble clicks to clickable ancestors', () => {
    const onAncestorClick = jest.fn();
    render(
      <Layout>
        <div onClick={onAncestorClick}>
          <HelpButton topic='quests' variant='icon' tip='Anything' />
        </div>
      </Layout>
    );

    fireEvent.click(screen.getByRole('button', { name: /anything/i }));
    expect(onAncestorClick).not.toHaveBeenCalled();
  });

  describe('width', () => {
    const open = () => {
      render(
        <Layout>
          <HelpButton topic='quests' />
        </Layout>
      );
      fireEvent.click(screen.getByRole('button', { name: /^help$/i }));
      return {
        panel: screen.getByRole('complementary'),
        handle: screen.getByRole('separator'),
      };
    };

    it('defaults to 420px', () => {
      const { panel } = open();
      expect(panel.style.width).toBe('420px');
    });

    it('restores a stored width, clamped to 320px..50vw', () => {
      window.localStorage.setItem(HELP_WIDTH_STORAGE_KEY, '9999');
      const { panel } = open();
      expect(panel.style.width).toBe('800px');
    });

    it('persists width changed from the keyboard to localStorage', () => {
      const { panel, handle } = open();
      fireEvent.keyDown(handle, { key: 'ArrowLeft' });
      expect(panel.style.width).toBe('444px');
      expect(window.localStorage.getItem(HELP_WIDTH_STORAGE_KEY)).toBe('444');
      fireEvent.keyDown(handle, { key: 'Home' });
      expect(panel.style.width).toBe('320px');
      expect(window.localStorage.getItem(HELP_WIDTH_STORAGE_KEY)).toBe('320');
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
      expect(panel.style.width).toBe('320px');
    });

    it('persists width changed by dragging the handle', () => {
      const { panel, handle } = open();
      fireEvent.pointerDown(handle, { clientX: 1000, pointerId: 1 });
      fireEvent.pointerMove(handle, { clientX: 900, pointerId: 1 });
      expect(panel.style.width).toBe('520px');
      fireEvent.pointerUp(handle, { clientX: 900, pointerId: 1 });
      expect(window.localStorage.getItem(HELP_WIDTH_STORAGE_KEY)).toBe('520');
    });
  });

  it('falls back to a full-screen panel below 1024px, still without a backdrop', () => {
    mockMatchMedia(false);
    render(
      <Layout>
        <HelpButton topic='quests' />
      </Layout>
    );
    fireEvent.click(screen.getByRole('button', { name: /^help$/i }));

    const panel = screen.getByRole('complementary');
    expect(panel).toHaveClass('fixed', 'inset-0');
    expect(panel.style.width).toBe('');
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(panel.parentElement?.querySelectorAll('.fixed')).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Close help' }));
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('keeps state while the page content swaps (client-side navigation)', () => {
    const { rerender } = render(
      <Layout>
        <HelpButton topic='quests' anchor='rewards' variant='icon' tip='A' />
      </Layout>
    );
    fireEvent.click(screen.getByRole('button', { name: /^help: a$/i }));
    rerender(
      <Layout>
        <p>another page</p>
      </Layout>
    );
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });
});
