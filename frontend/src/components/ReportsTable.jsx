function ReportsTable({ data }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 mt-10">
      <h2 className="text-xl font-semibold mb-4">Recent Transactions Report</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="px-3 py-2">Transaction ID</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((tx) => (
              <tr key={tx.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{tx.id}</td>
                <td className="px-3 py-2">₹{tx.amount}</td>
                <td className="px-3 py-2">{tx.time}</td>
                <td className="px-3 py-2">{tx.status || "Completed"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportsTable;
