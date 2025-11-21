import { act, fireEvent, render, waitFor } from '@testing-library/react';
import renderer from 'react-test-renderer';

import Tooltip from '@/app/src/components/common/Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('matches snapshot with default position (top)', () => {
    const tree = renderer
      .create(
        <Tooltip text="Test tooltip">
          <button>Hover me</button>
        </Tooltip>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot with bottom position', () => {
    const tree = renderer
      .create(
        <Tooltip text="Test tooltip" position="bottom">
          <button>Hover me</button>
        </Tooltip>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <Tooltip text="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(getByText('Hover me')).toBeInTheDocument();
  });

  it('does not show tooltip initially', () => {
    const { queryByText } = render(
      <Tooltip text="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(queryByText('Test tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip after 750ms delay on hover', async () => {
    const { getByText, queryByText } = render(
      <Tooltip text="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = getByText('Hover me');
    fireEvent.mouseEnter(button);

    // Tooltip should not be visible immediately
    expect(queryByText('Test tooltip')).not.toBeInTheDocument();

    // Fast-forward 750ms
    act(() => {
      jest.advanceTimersByTime(750);
    });

    // Tooltip should now be visible
    await waitFor(() => {
      expect(queryByText('Test tooltip')).toBeInTheDocument();
    });
  });

  it('hides tooltip when mouse leaves', async () => {
    const { getByText, queryByText } = render(
      <Tooltip text="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = getByText('Hover me');

    // Hover and wait for tooltip
    fireEvent.mouseEnter(button);
    act(() => {
      jest.advanceTimersByTime(750);
    });

    await waitFor(() => {
      expect(queryByText('Test tooltip')).toBeInTheDocument();
    });

    // Unhover
    fireEvent.mouseLeave(button);

    // Tooltip should be hidden
    expect(queryByText('Test tooltip')).not.toBeInTheDocument();
  });

  it('cancels tooltip if mouse leaves before 750ms', async () => {
    const { getByText, queryByText } = render(
      <Tooltip text="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = getByText('Hover me');

    // Hover
    fireEvent.mouseEnter(button);

    // Leave before 750ms
    act(() => {
      jest.advanceTimersByTime(500);
    });
    fireEvent.mouseLeave(button);

    // Fast-forward past 750ms
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Tooltip should not appear
    expect(queryByText('Test tooltip')).not.toBeInTheDocument();
  });
});
