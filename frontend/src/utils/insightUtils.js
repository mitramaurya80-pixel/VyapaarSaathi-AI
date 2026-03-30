export function getWeeklyAverage(dailySales) {
  if (dailySales.length === 0) return 0;
  const total = dailySales.reduce((sum, day) => sum + day.sales, 0);
  return Math.round(total / dailySales.length);
}

export function generateAISummary(todaySales, weeklyAverage, peakHour) {
  const difference = todaySales - weeklyAverage;
  const percentage = ((difference / weeklyAverage) * 100).toFixed(1);
  
  let trend = "";
  if (difference > 0) {
    trend = `📈 Sales are ${percentage}% above weekly average`;
  } else if (difference < 0) {
    trend = `📉 Sales are ${Math.abs(percentage)}% below weekly average`;
  } else {
    trend = `📊 Sales are at weekly average`;
  }
  
  return `${trend}. Peak activity at ${peakHour}. Continue monitoring trends to optimize operations.`;
}

export function generateInsights(merchantData) {
  const { transactions, dailySales } = merchantData;
  
  // Calculate repeat customer percentage
  const repeatCount = transactions.filter(t => t.customerType === "repeat").length;
  const repeatPercentage = ((repeatCount / transactions.length) * 100).toFixed(1);
  
  // Find weekend sales spike (Sat & Sun)
  const weekendSales = dailySales
    .filter(day => day.day === "Sat" || day.day === "Sun")
    .reduce((sum, day) => sum + day.sales, 0);
  const weekdaySales = dailySales
    .filter(day => day.day !== "Sat" && day.day !== "Sun")
    .reduce((sum, day) => sum + day.sales, 0);
  const weekendAvg = weekendSales / 2;
  const weekdayAvg = weekdaySales / 5;
  
  // Find inactive hours
  const hourCounts = {};
  transactions.forEach(t => {
    const hour = t.time.split(":")[0];
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const minActivityHour = Object.keys(hourCounts).reduce((min, hour) =>
    hourCounts[hour] < hourCounts[min] ? hour : min
  );
  
  // High-value customer pattern
  const highValueTransactions = transactions.filter(t => t.amount >= 500);
  const highValueCustomerType = highValueTransactions.length > 0
    ? highValueTransactions[0].customerType === "repeat" ? "Repeat Customers" : "New Customers"
    : "N/A";
  
  // Create insights array
  return [
    {
      title: "Repeat Customer Trend",
      description: `${repeatPercentage}% of transactions are from repeat customers. Focus on retention strategies to boost loyalty.`,
      icon: "👥"
    },
    {
      title: "Weekend Sales Spike",
      description: `Weekend average (₹${weekendAvg.toFixed(0)}) vs Weekday average (₹${weekdayAvg.toFixed(0)}). Capitalize on weekend demand.`,
      icon: "📅"
    },
    {
      title: "Inactive Business Hours",
      description: `Hour ${minActivityHour}:00 has the lowest activity. Consider targeted promotions during these hours.`,
      icon: "⏰"
    },
    {
      title: "High-Value Customer Pattern",
      description: `${highValueCustomerType} make the largest purchases (₹500+). Tailor offers to maximize this segment.`,
      icon: "💎"
    },
    {
      title: "Low Sales Activity",
      description: "Monitor early morning (06:00-08:00) for low sales. Strategic marketing can convert this window.",
      icon: "📊"
    }
  ];
}

export function generateRecommendations(merchantData) {
  const { transactions, dailySales } = merchantData;
  
  const recommendations = [];
  
  // Evening transaction activity (4 PM - 6 PM)
  const eveningTransactions = transactions.filter(t => {
    const hour = parseInt(t.time.split(":")[0]);
    return hour >= 16 && hour <= 18;
  });
  if (eveningTransactions.length > 0) {
    recommendations.push("Run evening offers between 4 PM and 6 PM to maximize footfall.");
  }
  
  // Repeat customers
  const repeatCount = transactions.filter(t => t.customerType === "repeat").length;
  if (repeatCount > transactions.length / 2) {
    recommendations.push("Reward repeat customers with loyalty cashback or special discounts.");
  }
  
  // High-value transactions
  const highValueCount = transactions.filter(t => t.amount >= 500).length;
  if (highValueCount > 0) {
    recommendations.push("Promote premium products to high-value customers during peak hours.");
  }
  
  // Snack sales trends
  const snackTransactions = transactions.filter(t => t.category === "Snacks");
  const weekendSnackTransactions = snackTransactions.filter(t => {
    // Assuming weekend is Sat/Sun, but since we don't have dates, check if weekend sales are higher
    const weekendSales = dailySales.filter(d => d.day === "Sat" || d.day === "Sun");
    return weekendSales.length > 0;
  });
  if (snackTransactions.length > 0) {
    recommendations.push("Stock more snacks before weekends to match demand trends.");
  }
  
  // General merchant growth tip
  recommendations.push("Use Paytm QR offer banners to increase conversion at checkout.");
  
  return recommendations;
}
export function getAIResponse(question, merchantData) {
  const lowerQuestion = question.toLowerCase();

  const totalSales = merchantData.transactions.reduce(
    (sum, txn) => sum + txn.amount,
    0
  );

  const peakTransaction = merchantData.transactions.reduce((max, txn) =>
    txn.amount > max.amount ? txn : max
  );

  const repeatCustomers = merchantData.transactions.filter(
    (txn) => txn.customerType === "repeat"
  ).length;

  if (lowerQuestion.includes("business") || lowerQuestion.includes("today")) {
    return `Your business generated ₹${totalSales} in sales today across ${merchantData.transactions.length} transactions. Performance is steady with strong evening activity.`;
  }

  if (lowerQuestion.includes("customers") || lowerQuestion.includes("peak")) {
    return `Your peak customer activity was around ${peakTransaction.time}. Evening hours are your strongest business window.`;
  }

  if (lowerQuestion.includes("improve")) {
    return `You can improve performance by running offers during inactive hours and increasing visibility during afternoon low-traffic periods.`;
  }

  if (lowerQuestion.includes("stock")) {
    return `Snacks and beverages show strong demand. Consider stocking more before weekends and evening peak hours.`;
  }

  if (lowerQuestion.includes("repeat")) {
    return `You had ${repeatCustomers} repeat-customer transactions today, which is a strong sign of customer loyalty.`;
  }

  return `Your business is showing healthy patterns. Focus on peak-hour offers, repeat customers, and category-wise promotions for better growth.`;
}
