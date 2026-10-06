import { fireEvent, render, screen, within } from '@testing-library/react';

import { HelpButton } from '../HelpButton';
import { QUESTS_HELP_ANCHORS } from '../help-topics';

describe('HelpButton + HelpDrawer (quests topic)', () => {
  let scrollIntoView: jest.Mock;

  beforeEach(() => {
    // jsdom does not implement scrollIntoView.
    scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  it('opens the drawer and renders the quests guide headings', () => {
    render(<HelpButton topic='quests' />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /help/i }));

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: 'Quest builder guide' })
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
        within(dialog).getByRole('heading', { name: heading })
      ).toBeInTheDocument();
    }
  });

  it('scrolls to and focuses the section named by anchor', () => {
    render(
      <HelpButton
        topic='quests'
        anchor={QUESTS_HELP_ANCHORS.objectives}
        variant='icon'
        tip='Objective types'
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /objective types/i }));

    const heading = within(screen.getByRole('dialog')).getByRole('heading', {
      name: 'Objectives',
    });
    expect(heading).toHaveAttribute('id', 'help-objectives');
    expect(scrollIntoView).toHaveBeenCalled();
    expect(scrollIntoView.mock.instances).toContain(heading);
    expect(heading).toHaveFocus();
  });

  it('opens at the top of the guide when no anchor is given', () => {
    render(<HelpButton topic='quests' />);
    fireEvent.click(screen.getByRole('button', { name: /help/i }));

    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(screen.getByTestId('help-scroll')).toHaveFocus();
  });

  it('follows in-guide links by scrolling the drawer, not the page', () => {
    render(<HelpButton topic='quests' />);
    fireEvent.click(screen.getByRole('button', { name: /help/i }));
    scrollIntoView.mockClear();

    const [link] = within(screen.getByRole('dialog')).getAllByRole('link', {
      name: 'Offering a quest',
    });
    fireEvent.click(link!);

    const target = within(screen.getByRole('dialog')).getByRole('heading', {
      name: 'Offering a quest',
    });
    expect(scrollIntoView.mock.instances).toContain(target);
    expect(target).toHaveFocus();
  });

  it('does not bubble clicks to clickable ancestors', () => {
    const onAncestorClick = jest.fn();
    render(
      <div onClick={onAncestorClick}>
        <HelpButton topic='quests' variant='icon' tip='Anything' />
      </div>
    );

    fireEvent.click(screen.getByRole('button', { name: /anything/i }));
    fireEvent.click(screen.getByRole('dialog'));

    expect(onAncestorClick).not.toHaveBeenCalled();
  });
});
