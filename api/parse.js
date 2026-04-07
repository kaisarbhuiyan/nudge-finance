export default async function handler(req, res) {
  // Only allow POST requests for this endpoint
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'No text provided to parse' });
  }

  // Define our OpenAI API Key stored in Vercel Environment Variables
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY environment variable");
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  // Define the strict rules for the AI to ensure we always get usable JSON back
  const systemPrompt = `
You are an expert financial assistant.
Your job is to parse natural language about a transaction (an expense or income) and extract specific details.
You MUST respond IN ONLY VALID JSON without any markdown formatting or extra text.

The JSON structure must exactly match string keys and types:
{
  "amount": number (positive for income, negative for expense. Output exact number, e.g., -23.50),
  "description": string (the merchant or short name of the transaction),
  "category": string (MUST be one of: "food", "groceries", "transport", "shopping", "income", "insurance", "fitness", "gas", "utilities", "subscriptions", "mortgage", "phone", "parking", "other"),
  "payMethod": string (MUST be one of: "credit", "debit", "cash", "bank")
}

If a user doesn't specify payment method, default to "credit".
If a user mentions getting paid, receiving a deposit, or salary, categorize as "income" and amount is positive.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Cost-effective model perfectly capable of JSON parsing
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.1 // Low temperature since we want strict JSON extraction
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // The AI should return a plain JSON string based on our rigid system prompt
    const aiResponseText = data.choices[0].message.content.trim();
    const parsedTransaction = JSON.parse(aiResponseText);

    res.status(200).json(parsedTransaction);

  } catch (error) {
    console.error('Error fetching/parsing from OpenAI:', error);
    res.status(500).json({ error: 'Failed to parse the transaction using AI.' });
  }
}
