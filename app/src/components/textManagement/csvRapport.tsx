import React from 'react';
import { CSVLink } from 'react-csv';
import { SearchState } from '../../interface/skattSokInterface';

interface DownloadCSVProps {
  searchResponse: SearchState;
}

const DownloadCSV: React.FC<DownloadCSVProps> = ({ searchResponse }) => {
  const { queryResponse, paragraphsResponse } = searchResponse;

  const csvData = [
    ['Type', 'Content'],
    ['Query Response', queryResponse],
    ...paragraphsResponse.map((paragraph, index) => [`Paragraph ${index + 1}`, paragraph]),
  ];

  if (queryResponse === '') {
    return (
      <button
        className="btn text-white m-1 px-6 rounded mr-10 cursor-not-allowed"
        disabled
      >
        Last ned
      </button>
    );
  }

  return (
    <CSVLink
      data={csvData}
      filename="Skatt-GPT svar.csv"
      className="btn text-white m-1 px-6 rounded mr-10"
    >
      Last ned
    </CSVLink>
  );
};

export default DownloadCSV;
