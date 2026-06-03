export type AiSummaryCard = {
  title: string;
  insight: string;
  tone: "green" | "gold" | "red";
};

export type AiInsightItem = {
  label: string;
  value: string;
  note: string;
};

export const aiSummaryCards: AiSummaryCard[] = [
  { title: "Today's AI Summary", insight: "M-Pesa sales are 23% higher than cash today, and Saturday remains your strongest sales day.", tone: "green" },
  { title: "Sales Health", insight: "Seed Oil 250ml is moving faster than other products and should be watched before the weekend rush.", tone: "green" },
  { title: "Stock Risk", insight: "Seed Oil 250ml, Rice 1kg, and Whole Milk 1L are closest to reorder level.", tone: "gold" },
  { title: "Debtor Risk", insight: "3 customers have overdue balances above KSh 5,000 and need follow-up.", tone: "red" },
  { title: "Expense Warning", insight: "Packaging expenses increased this week and may reduce your margin if not reviewed.", tone: "gold" },
  { title: "Profit Opportunity", insight: "Promoting Seed Oil 1L and Ugali Beef Stew this weekend could lift gross profit.", tone: "green" },
];

export const suggestedPrompts = [
  "What sold the most today?",
  "Which products are running low?",
  "Who owes me money?",
  "Which cashier sold the most?",
  "How much profit did I make this week?",
  "What should I restock first?",
  "Which expenses are too high?",
  "Summarize today's business performance.",
];

export const mockAiResponses: Record<string, string> = {
  "What sold the most today?": "Based on today's mock sales data, Seed Oil 1L and Ugali Beef Stew are your strongest products. Seed Oil 250ml is also moving quickly and should be watched before the weekend.",
  "Which products are running low?": "Seed Oil 250ml, Rice 1kg, and Whole Milk 1L are closest to reorder level. Restock Seed Oil 250ml first because it is moving faster than the other low-stock products.",
  "Who owes me money?": "Karibu Restaurant, Wholesale Customer, and Beauty Shop Customer have open balances. Karibu Restaurant should be followed up first because its overdue balance is above KSh 5,000.",
  "Which cashier sold the most?": "Mary Wanjiku has the strongest cashier performance in today's mock data, with higher M-Pesa collections than cash collections.",
  "How much profit did I make this week?": "The mock weekly profit estimate is positive, supported by strong sales on Saturday and Seed Oil 1L performance. Packaging costs should be reviewed to protect margins.",
  "What should I restock first?": "Restock Seed Oil 250ml before stock falls below 10 units. It is moving faster than other products and may run out before the weekend.",
  "Which expenses are too high?": "Packaging expenses increased this week. Review supplier prices and bottle usage because this category is the strongest current cost warning.",
  "Summarize today's business performance.": "Based on today's mock sales data, Seed Oil 1L and Ugali Beef Stew are your strongest products. Your M-Pesa sales are higher than cash, and you have 3 customers with overdue balances. Consider restocking Seed Oil 250ml before the weekend.",
};

export const fallbackAiResponse = "Based on the current mock POS data, sales are healthy, M-Pesa is leading cash, debtor follow-up is needed, and Seed Oil 250ml should be restocked before the weekend.";

export const salesInsights: AiInsightItem[] = [
  { label: "Best-selling product", value: "Seed Oil 1L", note: "Strongest product by value today" },
  { label: "Slow-moving product", value: "Brake Pads Toyota Axio Front", note: "Low sales frequency this week" },
  { label: "Best payment method", value: "M-Pesa", note: "23% higher than cash today" },
  { label: "Best sales day", value: "Saturday", note: "Highest average daily sales" },
  { label: "Sales trend placeholder", value: "Upward", note: "Weekend demand is improving" },
];

export const stockInsights: AiInsightItem[] = [
  { label: "Low stock products", value: "Seed Oil 250ml, Rice 1kg, Whole Milk 1L", note: "Closest to reorder level" },
  { label: "Fast-moving products", value: "Seed Oil 1L, Ugali Beef Stew", note: "High activity today" },
  { label: "Slow-moving stock", value: "Brake Pads Toyota Axio Front", note: "Review pricing or placement" },
  { label: "Suggested reorder items", value: "Seed Oil 250ml first", note: "Restock before weekend demand" },
];

export const debtorInsights: AiInsightItem[] = [
  { label: "Total amount owed", value: "KSh 161,900", note: "Open customer balances" },
  { label: "Overdue customers", value: "3 customers", note: "Balances above KSh 5,000" },
  { label: "High-risk debtors", value: "Karibu Restaurant, Wholesale Customer", note: "Needs collection follow-up" },
  { label: "Suggested follow-up action", value: "Send reminder today", note: "Use SMS or phone call before close" },
];

export const expenseInsights: AiInsightItem[] = [
  { label: "Highest expense category", value: "Stock purchase expense", note: "Largest approved cost category" },
  { label: "Expense increase warning", value: "Packaging", note: "Packaging costs increased this week" },
  { label: "Profit leakage warning", value: "Transport and packaging", note: "Review supplier and delivery costs" },
];

export const staffInsights: AiInsightItem[] = [
  { label: "Top cashier", value: "Mary Wanjiku", note: "Highest mock sales activity today" },
  { label: "Low activity user", value: "Tevin Support", note: "Inactive staff account in mock data" },
  { label: "Suspicious/refund activity placeholder", value: "No red flag", note: "Refund anomaly detection will come later" },
  { label: "Shift summary placeholder", value: "CBD till strongest", note: "Nairobi CBD Store led today's activity" },
];

export const recommendedActions = [
  "Restock Seed Oil 250ml before stock falls below 10 units.",
  "Follow up with Karibu Restaurant about overdue KSh 8,500.",
  "Review packaging expenses because they increased this week.",
  "Promote your top-selling product this weekend.",
  "Check low stock items before opening tomorrow.",
];

export const comingSoonAiFeatures = [
  "AI daily business summary",
  "AI sales forecasting",
  "AI stock reorder suggestions",
  "AI debtor follow-up messages",
  "AI SMS campaign suggestions",
  "AI product performance analysis",
  "AI cashier performance summary",
  "AI WhatsApp replies",
  "AI report explanation",
];
