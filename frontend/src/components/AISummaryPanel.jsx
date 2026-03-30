function AISummaryPanel({ aiSummary }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl shadow p-6 mb-10">
      <h2 className="text-xl font-semibold text-blue-700 mb-2">AI Summary</h2>
      <p className="text-gray-700 text-lg">{aiSummary}</p>
    </div>
  );
}

export default AISummaryPanel;
