const recentSalesData = [
  {
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
  },
  {
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
  },
  {
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
  },
  {
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
  },
  {
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
  },
];

export default function RecentSales() {
  return (
    <div className="space-y-8">
      {recentSalesData.map((sale, index) => (
        <div key={index} className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">{sale.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{sale.email}</p>
          </div>
          <div className="ml-auto font-medium text-gray-900 dark:text-white">{sale.amount}</div>
        </div>
      ))}
    </div>
  );
}
