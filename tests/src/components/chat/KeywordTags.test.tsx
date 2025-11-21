import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderer from 'react-test-renderer';

import KeywordTags from '@/app/src/components/chat/KeywordTags';

describe('KeywordTags', () => {
  const mockKeywords = ['mva', 'skatt', 'fradrag'];
  const mockOnRemoveKeyword = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('matches snapshot with keywords', () => {
    const tree = renderer
      .create(<KeywordTags keywords={mockKeywords} onRemoveKeyword={mockOnRemoveKeyword} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot with empty keywords', () => {
    const tree = renderer
      .create(<KeywordTags keywords={[]} onRemoveKeyword={mockOnRemoveKeyword} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders nothing when keywords array is empty', () => {
    const { container } = render(
      <KeywordTags keywords={[]} onRemoveKeyword={mockOnRemoveKeyword} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all keywords', () => {
    const { getByText } = render(
      <KeywordTags keywords={mockKeywords} onRemoveKeyword={mockOnRemoveKeyword} />
    );

    mockKeywords.forEach(keyword => {
      expect(getByText(keyword)).toBeInTheDocument();
    });
  });

  it('calls onRemoveKeyword with correct index when keyword is clicked', async () => {
    const { getByText } = render(
      <KeywordTags keywords={mockKeywords} onRemoveKeyword={mockOnRemoveKeyword} />
    );

    const firstKeywordButton = getByText('mva').closest('button');
    await userEvent.click(firstKeywordButton!);

    expect(mockOnRemoveKeyword).toHaveBeenCalledTimes(1);
    expect(mockOnRemoveKeyword).toHaveBeenCalledWith(0);
  });

  it('calls onRemoveKeyword with correct index for second keyword', async () => {
    const { getByText } = render(
      <KeywordTags keywords={mockKeywords} onRemoveKeyword={mockOnRemoveKeyword} />
    );

    const secondKeywordButton = getByText('skatt').closest('button');
    await userEvent.click(secondKeywordButton!);

    expect(mockOnRemoveKeyword).toHaveBeenCalledTimes(1);
    expect(mockOnRemoveKeyword).toHaveBeenCalledWith(1);
  });
});
