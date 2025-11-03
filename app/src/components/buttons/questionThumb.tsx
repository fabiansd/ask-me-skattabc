// PARKED: This component is dormant and not currently in use
// TODO: Integrate with feedback API when ready to implement thumbs up/down functionality

import React from 'react';

import { Icons } from '../icons/iconsWrapper';

// interface QuestionThumbProps {
//   searchResponse: any; // TODO: Define proper type when reactivating
//   setSearchResponse: React.Dispatch<React.SetStateAction<any>>;
//   getSearchHistory: () => any[];
//   setSearchHistory: React.Dispatch<React.SetStateAction<any[]>>;
// }

const QuestionThumb: React.FC = () => {
  // const handleChatFeedback = (feedback: 'thumbsUp' | 'thumbsDown') => {
  //   const ratedChatResponse = { ...searchResponse, chatFeedback: feedback };
  //   setSearchResponse(ratedChatResponse);

  //   const currentSearchHistory = getSearchHistory();
  //   const updatedSearchHistory = currentSearchHistory.map(item =>
  //     item.id === searchResponse.id ? ratedChatResponse : item
  //   );
  //   // TODO: We will go away from localstorage and use the db
  //   //localStorage.setItem("searchHistory", JSON.stringify(updatedSearchHistory));
  //   setSearchHistory(updatedSearchHistory);
  // };

  return (
    <div className="flex items-center gap-2">
      <button
        className="btn btn-sm bg-green-600 hover:bg-green-700 text-white m-1 px-6 rounded"
        onClick={() => console.log('Thumbs up - TODO: Implement feedback API')}
      >
        <Icons.ThumbsUp className="w-5 h-5" />
      </button>
      <button
        className="btn btn-sm bg-red-600 hover:bg-red-700 text-white  m-1 px-6 rounded"
        onClick={() => console.log('Thumbs down - TODO: Implement feedback API')}
      >
        <Icons.ThumbsDown className="w-5 h-5" />
      </button>
    </div>
  );
};

export default QuestionThumb;
