export function getTodaySales(transactions) {
  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
}

export function getWeeklySales(dailySales) {
  return dailySales.reduce((total, day) => total + day.sales, 0);
}

export function getTransactionCount(transactions) {
  return transactions.length;
}

export function getPeakHour(transactions) {
  if (transactions.length === 0) return "N/A";
  
  const hourCounts = {};
  transactions.forEach((transaction) => {
    const hour = transaction.time.split(":")[0];
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  const peakHour = Object.keys(hourCounts).reduce((max, hour) =>
    hourCounts[hour] > hourCounts[max] ? hour : max
  );
  
  return `${peakHour}:00`;
}
