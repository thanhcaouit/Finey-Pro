
import { GoogleGenAI } from "@google/genai";
import { Transaction, Account, Category } from "../types";

export const getFinancialInsights = async (
  transactions: Transaction[],
  accounts: Account[],
  categories: Category[]
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prepare a summary of recent financial activity for the AI
  const summary = transactions.slice(0, 50).map(t => {
    const cat = categories.find(c => c.id === t.categoryId)?.name;
    const acc = accounts.find(a => a.id === t.accountId)?.name;
    return `${t.date}: ${t.amount} ${t.type} (${cat}) via ${acc} - ${t.note}`;
  }).join('\n');

  // Fix: changed a.balance to a.balanceNew as 'balance' property does not exist on Account type
  const prompt = `
    As a professional financial advisor, analyze my recent transactions and overall net worth.
    Current Accounts: ${accounts.map(a => `${a.name}: ${a.balanceNew}`).join(', ')}
    Recent Transactions:
    ${summary}

    Provide:
    1. A short summary of my spending habits this month.
    2. One specific tip to save more money based on the data.
    3. An overall "Financial Health Score" from 0-100.
    4. Categorize my spending into "Needs", "Wants", and "Savings/Debt".

    Keep the response concise and friendly in Vietnamese.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Không thể kết nối với chuyên gia AI lúc này. Vui lòng thử lại sau.";
  }
};
