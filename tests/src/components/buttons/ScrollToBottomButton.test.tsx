import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderer from 'react-test-renderer';

import ScrollToBottomButton from '@/app/src/components/buttons/ScrollToBottomButton';

describe('ScrollToBottomButton', () => {
  it('matches snapshot', () => {
    const mockOnClick = jest.fn();
    const tree = renderer.create(<ScrollToBottomButton onClick={mockOnClick} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with correct aria-label', () => {
    const mockOnClick = jest.fn();
    const { getByLabelText } = render(<ScrollToBottomButton onClick={mockOnClick} />);
    expect(getByLabelText('Scroll til bunn')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const mockOnClick = jest.fn();
    const { getByLabelText } = render(<ScrollToBottomButton onClick={mockOnClick} />);

    const button = getByLabelText('Scroll til bunn');
    await userEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
