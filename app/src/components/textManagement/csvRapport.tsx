// PARKED: This component is dormant and not currently in use
// TODO: Reimplement with proper conversation/query response data structure

import React from 'react';
import { CSVLink } from 'react-csv';

// interface DownloadCSVProps {
//   searchResponse: any; // TODO: Define proper type when reactivating
// }

const DownloadCSV: React.FC = () => {
  // const { queryResponse, paragraphsResponse } = searchResponse;

  // const csvData = [
  //   ['Type', 'Content'],
  //   ['Query Response', queryResponse],
  //   ...paragraphsResponse.map((paragraph: string, index: number) => [
  //     `Paragraph ${index + 1}`,
  //     paragraph,
  //   ]),
  // ];

  // Placeholder implementation
  const csvData = [
    ['Type', 'Content'],
    ['Placeholder', 'TODO: Implement CSV export functionality'],
  ];

  return (
    <CSVLink
      data={csvData}
      filename="Skatt-AI svar.csv"
      className="btn text-white m-1 px-6 rounded mr-10"
    >
      Last ned
    </CSVLink>
  );
};

export default DownloadCSV;
