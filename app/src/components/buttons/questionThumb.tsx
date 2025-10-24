import React from "react";
import { SearchState } from "../../interface/skattSokInterface";
import { Icons } from "../icons/iconsWrapper";

interface QuestionThumbProps {
  searchResponse: SearchState;
  setSearchResponse: React.Dispatch<React.SetStateAction<SearchState>>;
  getSearchHistory: () => SearchState[];
  setSearchHistory: React.Dispatch<React.SetStateAction<SearchState[]>>;
}

const QuestionThumb: React.FC<QuestionThumbProps> = ({
  searchResponse,
  setSearchResponse,
  getSearchHistory,
  setSearchHistory,
}) => {
  const handleChatFeedback = (feedback: "thumbsUp" | "thumbsDown") => {
    const ratedChatResponse = { ...searchResponse, chatFeedback: feedback };
    setSearchResponse(ratedChatResponse);

    const currentSearchHistory = getSearchHistory();
    const updatedSearchHistory = currentSearchHistory.map((item) =>
      item.id === searchResponse.id ? ratedChatResponse : item
    );
    // TODO: We will go away from localstorage and use the db
    //localStorage.setItem("searchHistory", JSON.stringify(updatedSearchHistory));
    setSearchHistory(updatedSearchHistory);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        className="btn btn-sm bg-green-600 hover:bg-green-700 text-white m-1 px-6 rounded"
        onClick={() => handleChatFeedback("thumbsUp")}
      >
        <Icons.ThumbsUp className="w-5 h-5" />
      </button>
      <button
        className="btn btn-sm bg-red-600 hover:bg-red-700 text-white  m-1 px-6 rounded"
        onClick={() => handleChatFeedback("thumbsDown")}
      >
        <Icons.ThumbsDown className="w-5 h-5" />
      </button>
    </div>
  );
};

export default QuestionThumb;
