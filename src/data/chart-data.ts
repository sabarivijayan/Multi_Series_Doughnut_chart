import { NextApiRequest, NextApiResponse } from 'next';

export default (req: NextApiRequest, res: NextApiResponse) => {
  // Demo data, replace with data fetched from your backend
  // In the /api/chart-data.ts file
const chartData = [
    { label: '1/10', value: 1, name: 'Governance' },
    { label: '2/10', value: 2, name: 'Communication' },
    { label: '3/10', value: 3, name: 'Education' },
    { label: '4/10', value: 4, name: 'Assets' },
    { label: '5/10', value: 5, name: 'Structures' },
    { label: '6/10', value: 6, name: 'Advisors' },
    { label: '7/10', value: 7, name: 'Vision' },
    { label: '8/10', value: 8, name: 'Health' },
    { label: '9/10', value: 9, name: 'Philanthropy' },
    { label: '10/10', value: 10, name: 'Documentation' },
  ];

  res.status(200).json(chartData);
};