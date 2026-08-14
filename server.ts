import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const DEFAULT_PORT = Number(process.env.PORT || 3000);

function normalizeOrigin(input: string): string {
  const raw = (input || '').trim();
  if (!raw) return '';

  const withProtocol = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
  try {
    const parsed = new URL(withProtocol);
    return parsed.origin;
  } catch {
    return withProtocol.replace(/\/$/, '');
  }
}

const configuredAppUrl = normalizeOrigin(process.env.APP_URL || '');
const configuredFrontendUrl = normalizeOrigin(process.env.FRONTEND_URL || '');
const configuredOriginsList = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((item) => normalizeOrigin(item))
  .filter(Boolean);

const allowedOrigins = new Set([
  configuredAppUrl,
  configuredFrontendUrl,
  ...configuredOriginsList,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

function startServer(portNumber: number) {
  const server = app.listen(portNumber, '0.0.0.0', () => {
    console.log(`Expense Tracker server running on http://localhost:${portNumber}`);
  });

  server.on('error', (err: any) => {
    if (err && err.code === 'EADDRINUSE') {
      const nextPort = portNumber + 1;
      console.warn(`Port ${portNumber} is already in use. Retrying on port ${nextPort}.`);
      startServer(nextPort);
      return;
    }

    throw err;
  });
}

app.use(express.json());

app.use((req, res, next) => {
  const requestOriginRaw = req.headers.origin as string | undefined;
  const requestOrigin = normalizeOrigin(requestOriginRaw || '');

  if (requestOrigin && allowedOrigins.has(requestOrigin)) {
    res.header('Access-Control-Allow-Origin', requestOrigin);
  }

  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

const transientGeminiWarnings = new Set<string>();

// Initialize Gemini Client server-side
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment variables');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient Gemini model caller with retry and fallback across models
async function generateContentWithFallback(params: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: any;
}): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  // Prioritized list of active valid models according to @google/genai specifications
  const modelsToTry = [
    'gemini-3.7-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest'
  ];

  for (const model of modelsToTry) {
    // Attempt up to 2 tries per model with brief backoff on 503 / 429 errors
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const config: any = {};
        if (params.systemInstruction) config.systemInstruction = params.systemInstruction;
        if (params.responseMimeType) config.responseMimeType = params.responseMimeType;
        if (params.responseSchema) config.responseSchema = params.responseSchema;

        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: Object.keys(config).length > 0 ? config : undefined,
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isTransient = errMsg.includes('503') || 
                            errMsg.includes('high demand') || 
                            errMsg.includes('UNAVAILABLE') || 
                            errMsg.includes('429') || 
                            errMsg.includes('RESOURCE_EXHAUSTED') ||
                            errMsg.includes('overloaded');

        const warnKey = `${model}:${attempt}`;
        if (isTransient) {
          if (!transientGeminiWarnings.has(warnKey)) {
            console.warn(`[Gemini API] ${model} is temporarily unavailable; falling back to local logic.`);
            transientGeminiWarnings.add(warnKey);
          }
        } else {
          console.warn(`[Gemini API] Model ${model} attempt ${attempt} failed:`, errMsg);
        }

        if (isTransient && attempt === 1) {
          // Brief 300ms pause before retrying the same model
          await new Promise((r) => setTimeout(r, 300));
          continue;
        }

        // If non-transient or retry exhausted, break inner loop to try next model in tier
        break;
      }
    }
  }

  return null;
}

// Deterministic fallback calculator for spending insights
function calculateDeterministicInsights(
  expenses: any[] = [],
  budgets: any[] = [],
  categories: any[] = [],
  currencySymbol = '$'
) {
  const totalSpend = (expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalBudget = (budgets || []).reduce((sum, b) => sum + (Number(b.monthly_limit) || 0), 0);

  // Category breakdown
  const categorySpendMap = new Map<string, number>();
  for (const exp of expenses || []) {
    const catId = exp.category_id || exp.categoryId || 'unknown';
    const amount = Number(exp.amount) || 0;
    categorySpendMap.set(catId, (categorySpendMap.get(catId) || 0) + amount);
  }

  let topCategoryName = 'General Spending';
  let topCategoryAmount = 0;

  for (const [catId, amount] of categorySpendMap.entries()) {
    if (amount > topCategoryAmount) {
      topCategoryAmount = amount;
      const catObj = categories.find((c) => c.id === catId);
      topCategoryName = catObj ? catObj.name : topCategoryName;
    }
  }

  // Budget warnings
  const budgetWarnings: string[] = [];
  for (const b of budgets || []) {
    const limit = Number(b.monthly_limit) || 0;
    if (limit > 0) {
      const catSpend = categorySpendMap.get(b.category_id) || 0;
      const catObj = categories.find((c) => c.id === b.category_id);
      const catName = catObj ? catObj.name : 'Category';
      if (catSpend > limit) {
        const excess = catSpend - limit;
        budgetWarnings.push(
          `${catName} has exceeded its monthly cap of ${currencySymbol}${limit.toFixed(2)} by ${currencySymbol}${excess.toFixed(2)}.`
        );
      } else if (catSpend >= limit * 0.85) {
        budgetWarnings.push(
          `${catName} has used ${Math.round((catSpend / limit) * 100)}% of its allocated ${currencySymbol}${limit.toFixed(2)} budget.`
        );
      }
    }
  }

  if (totalBudget > 0 && totalSpend > totalBudget && budgetWarnings.length === 0) {
    budgetWarnings.push(
      `Overall spending (${currencySymbol}${totalSpend.toFixed(2)}) has passed your monthly target limit (${currencySymbol}${totalBudget.toFixed(2)}).`
    );
  }

  // Objective health score calculation (1 - 100)
  let healthScore = 85;
  if (totalBudget > 0) {
    const ratio = totalSpend / totalBudget;
    if (ratio <= 0.6) healthScore = 95;
    else if (ratio <= 0.85) healthScore = 88;
    else if (ratio <= 1.0) healthScore = 78;
    else if (ratio <= 1.2) healthScore = 60;
    else healthScore = Math.max(25, Math.round(50 - (ratio - 1.2) * 40));
  } else if (totalSpend > 0) {
    healthScore = 82;
  }

  // Savings opportunities based on spending patterns
  const savingOpportunities: string[] = [];
  if (topCategoryAmount > 0) {
    savingOpportunities.push(
      `Your largest expense sector is ${topCategoryName} (${currencySymbol}${topCategoryAmount.toFixed(2)}). Setting a 10% reduction cap here saves ${currencySymbol}${(topCategoryAmount * 0.1).toFixed(2)} monthly.`
    );
  }
  savingOpportunities.push(
    'Audit recurring recurring subscriptions and utility tariffs to identify unutilized plans.'
  );
  savingOpportunities.push(
    'Consolidate spontaneous transactions by using the AI Natural Language Quick-Add for real-time tracking.'
  );

  const projectedMonthlySpend = Math.round(totalSpend * 1.12);

  return {
    summary:
      expenses.length > 0
        ? `You have logged ${expenses.length} transactions totaling ${currencySymbol}${totalSpend.toFixed(2)}. Spending velocity is ${totalBudget > 0 && totalSpend > totalBudget ? 'pacing above target' : 'in a healthy range'}.`
        : `Your ledger is clean and ready. Add expenses via the Quick-Add bar to generate real-time metrics.`,
    topSpendingTakeaway:
      topCategoryAmount > 0
        ? `${topCategoryName} represents ${totalSpend > 0 ? Math.round((topCategoryAmount / totalSpend) * 100) : 0}% of your recorded outflows this period.`
        : 'No major categorical concentration detected yet.',
    budgetWarnings,
    savingOpportunities: savingOpportunities.slice(0, 3),
    projectedMonthlySpend: projectedMonthlySpend > 0 ? projectedMonthlySpend : totalSpend,
    healthScore,
    keyRecommendations: [
      'Maintain continuous logging to improve budget pacing accuracy.',
      'Review high-frequency category caps before end-of-month cycles.',
      'Rebalance unused budget limits to emergency savings reserves.',
    ],
  };
}

// Deterministic fallback parser for natural language expense inputs
function calculateDeterministicParseExpense(
  prompt: string,
  categories: any[] = [],
  referenceDate: string
) {
  const lower = prompt.toLowerCase();

  // Extract amount
  const amountMatch = prompt.match(/(?:\$|usd\s*|€|£)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
  let amount = 0;
  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1]);
  } else {
    // Word numbers check
    if (lower.includes('twenty')) amount = 20;
    else if (lower.includes('thirty')) amount = 30;
    else if (lower.includes('forty')) amount = 40;
    else if (lower.includes('fifty')) amount = 50;
    else if (lower.includes('hundred')) amount = 100;
    else amount = 15;
  }

  // Extract date
  let computedDate = referenceDate;
  const refDateObj = new Date(referenceDate);

  if (lower.includes('yesterday')) {
    const yesterday = new Date(refDateObj);
    yesterday.setDate(yesterday.getDate() - 1);
    computedDate = yesterday.toISOString().split('T')[0];
  } else if (lower.includes('2 days ago') || lower.includes('two days ago')) {
    const d = new Date(refDateObj);
    d.setDate(d.getDate() - 2);
    computedDate = d.toISOString().split('T')[0];
  } else if (lower.includes('3 days ago') || lower.includes('three days ago')) {
    const d = new Date(refDateObj);
    d.setDate(d.getDate() - 3);
    computedDate = d.toISOString().split('T')[0];
  } else {
    const explicitDateMatch = prompt.match(/\b(202[0-9]-[0-1][0-9]-[0-3][0-9])\b/);
    if (explicitDateMatch) {
      computedDate = explicitDateMatch[1];
    }
  }

  // Category matching
  let matchedCategoryName = categories[0]?.name || 'Shopping & Personal';

  if (
    lower.includes('food') ||
    lower.includes('dinner') ||
    lower.includes('lunch') ||
    lower.includes('breakfast') ||
    lower.includes('coffee') ||
    lower.includes('restaurant') ||
    lower.includes('sushi') ||
    lower.includes('pizza') ||
    lower.includes('cafe') ||
    lower.includes('starbucks')
  ) {
    matchedCategoryName = 'Food & Dining';
  } else if (
    lower.includes('grocer') ||
    lower.includes('trader') ||
    lower.includes('market') ||
    lower.includes('supermarket') ||
    lower.includes('whole foods') ||
    lower.includes('target') ||
    lower.includes('walmart')
  ) {
    matchedCategoryName = 'Groceries';
  } else if (
    lower.includes('uber') ||
    lower.includes('lyft') ||
    lower.includes('gas') ||
    lower.includes('transit') ||
    lower.includes('bus') ||
    lower.includes('train') ||
    lower.includes('car') ||
    lower.includes('fuel') ||
    lower.includes('parking')
  ) {
    matchedCategoryName = 'Transportation';
  } else if (
    lower.includes('rent') ||
    lower.includes('mortgage') ||
    lower.includes('apartment') ||
    lower.includes('maintenance')
  ) {
    matchedCategoryName = 'Housing & Rent';
  } else if (
    lower.includes('electric') ||
    lower.includes('water') ||
    lower.includes('bill') ||
    lower.includes('internet') ||
    lower.includes('wifi') ||
    lower.includes('phone')
  ) {
    matchedCategoryName = 'Utilities & Bills';
  } else if (
    lower.includes('movie') ||
    lower.includes('game') ||
    lower.includes('cinema') ||
    lower.includes('concert') ||
    lower.includes('netflix') ||
    lower.includes('spotify') ||
    lower.includes('club')
  ) {
    matchedCategoryName = 'Entertainment';
  } else if (
    lower.includes('doctor') ||
    lower.includes('pharmacy') ||
    lower.includes('medicine') ||
    lower.includes('gym') ||
    lower.includes('dental') ||
    lower.includes('health')
  ) {
    matchedCategoryName = 'Healthcare';
  } else if (
    lower.includes('flight') ||
    lower.includes('hotel') ||
    lower.includes('airbnb') ||
    lower.includes('vacation') ||
    lower.includes('trip')
  ) {
    matchedCategoryName = 'Travel';
  } else if (
    lower.includes('book') ||
    lower.includes('course') ||
    lower.includes('tuition') ||
    lower.includes('class')
  ) {
    matchedCategoryName = 'Education';
  }

  // Find exact case category name if exists
  const exactCat = categories.find(
    (c) =>
      c.name.toLowerCase() === matchedCategoryName.toLowerCase() ||
      c.name.toLowerCase().includes(matchedCategoryName.toLowerCase())
  );
  if (exactCat) {
    matchedCategoryName = exactCat.name;
  }

  // Clean note
  let cleanedNote = prompt.trim();
  cleanedNote = cleanedNote.replace(/^(spent|paid|bought|got)\s+/i, '');

  return {
    amount: amount || 20,
    categoryName: matchedCategoryName,
    date: computedDate,
    note: cleanedNote.charAt(0).toUpperCase() + cleanedNote.slice(1),
    confidence: 0.88,
    reasoning: 'Extracted transaction details with NLP pattern matching',
  };
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasSupabaseUrl: Boolean(process.env.VITE_SUPABASE_URL),
    timestamp: new Date().toISOString(),
  });
});

// API: AI Quick-Add Natural Language Expense Parser
app.post('/api/gemini/parse-expense', async (req, res) => {
  try {
    const { prompt, categories = [], currentDate } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt string is required' });
    }

    const referenceDate = currentDate || new Date().toISOString().split('T')[0];
    const categoryList =
      Array.isArray(categories) && categories.length > 0
        ? categories.map((c: any) => c.name || c).join(', ')
        : 'Food & Dining, Groceries, Transportation, Housing & Rent, Utilities & Bills, Entertainment, Healthcare, Shopping & Personal, Travel, Education';

    const systemInstruction = `You are a financial transaction NLP parser.
Your task is to parse a natural language input into a structured expense entry.
Current date reference context: ${referenceDate}.
Available Categories: [${categoryList}].
Instructions:
1. Extract the exact numeric amount (convert currencies or words like 'forty five' into float). If no amount is clear, give your best estimate or 0.
2. Select the closest matching category from the available category list.
3. Compute the correct transaction date (YYYY-MM-DD) based on terms like 'yesterday', 'last Friday', 'today', '2 days ago', 'on the 15th', etc., relative to the reference date: ${referenceDate}.
4. Generate a concise, clear title or note describing what was purchased or where.
5. Provide a confidence score between 0.0 and 1.0.`;

    const aiText = await generateContentWithFallback({
      contents: `Parse this expense prompt: "${prompt}"`,
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          amount: { type: Type.NUMBER, description: 'The numeric cost/amount of the expense' },
          categoryName: {
            type: Type.STRING,
            description: 'The best matching category name from the provided list',
          },
          date: {
            type: Type.STRING,
            description: 'The computed date of the expense in YYYY-MM-DD format',
          },
          note: {
            type: Type.STRING,
            description: 'A clean summary note or merchant description for the expense',
          },
          confidence: { type: Type.NUMBER, description: 'Confidence value from 0 to 1' },
          reasoning: {
            type: Type.STRING,
            description: 'Brief explanation of how the date/category was inferred',
          },
        },
        required: ['amount', 'categoryName', 'date', 'note'],
      },
    });

    if (aiText) {
      try {
        const parsed = JSON.parse(aiText);
        return res.json(parsed);
      } catch (jsonErr) {
        console.warn('Failed to parse AI JSON response, using deterministic fallback');
      }
    }

    // High reliability fallback
    const fallbackParsed = calculateDeterministicParseExpense(prompt, categories, referenceDate);
    return res.json(fallbackParsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/parse-expense:', error);
    const fallbackParsed = calculateDeterministicParseExpense(
      req.body?.prompt || '',
      req.body?.categories || [],
      req.body?.currentDate || new Date().toISOString().split('T')[0]
    );
    return res.json(fallbackParsed);
  }
});

// API: AI Spending Insights & Anomaly Detection
app.post('/api/gemini/insights', async (req, res) => {
  try {
    const { expenses = [], budgets = [], categories = [], currencySymbol = '$' } = req.body;

    const payloadContext = {
      expensesCount: expenses?.length || 0,
      totalExpenses: expenses?.slice(0, 50),
      budgets: budgets || [],
      categories: categories || [],
      currency: currencySymbol,
      currentDate: new Date().toISOString().split('T')[0],
    };

    const systemInstruction = `You are a certified financial planner and smart AI spending analyst.
Analyze the user's spending data, category limits, and historical patterns.
Output thoughtful, data-driven, constructive financial advice without generic fluff.
Calculate an objective financial health score (1 to 100) based on budget adherence and spending distribution.
Return strict JSON adhering to the provided schema.`;

    const aiText = await generateContentWithFallback({
      contents: `Analyze these user expenses and budget limits:\n${JSON.stringify(payloadContext, null, 2)}`,
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: 'A 2-3 sentence executive summary of spending trends and pacing.',
          },
          topSpendingTakeaway: {
            type: Type.STRING,
            description: 'Key insight about top spend category or notable shift.',
          },
          budgetWarnings: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              'Specific warnings for categories that exceeded or are nearing their budget limit.',
          },
          savingOpportunities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2-3 concrete, actionable opportunities to cut costs.',
          },
          projectedMonthlySpend: {
            type: Type.NUMBER,
            description: 'Estimated total end-of-month spend based on current daily velocity',
          },
          healthScore: {
            type: Type.INTEGER,
            description: 'Financial health score integer from 1 to 100',
          },
          keyRecommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 practical tips for the user.',
          },
        },
        required: [
          'summary',
          'topSpendingTakeaway',
          'budgetWarnings',
          'savingOpportunities',
          'healthScore',
          'keyRecommendations',
        ],
      },
    });

    if (aiText) {
      try {
        const parsed = JSON.parse(aiText);
        return res.json(parsed);
      } catch (jsonErr) {
        console.warn('Failed to parse AI Insights JSON response, using deterministic fallback');
      }
    }

    // Deterministic fallback calculation
    const fallbackInsights = calculateDeterministicInsights(
      expenses,
      budgets,
      categories,
      currencySymbol
    );
    return res.json(fallbackInsights);
  } catch (error: any) {
    console.error('Error in /api/gemini/insights:', error);
    const fallbackInsights = calculateDeterministicInsights(
      req.body?.expenses || [],
      req.body?.budgets || [],
      req.body?.categories || [],
      req.body?.currencySymbol || '$'
    );
    return res.json(fallbackInsights);
  }
});

// API: AI Financial Assistant / Spending Q&A
app.post('/api/gemini/advisor', async (req, res) => {
  try {
    const { question, expenses = [], budgets = [], categories = [], currencySymbol = '$' } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const context = {
      expensesCount: expenses?.length || 0,
      recentExpenses: expenses?.slice(0, 30),
      budgets,
      categories,
      currency: currencySymbol,
    };

    const systemInstruction = `You are an empathetic, sharp personal financial advisor embedded directly inside the user's expense tracker. Answer questions clearly, citing exact numbers and categories from the provided data when available. Be concise, encouraging, and actionable.`;

    const aiText = await generateContentWithFallback({
      contents: `User Question: "${question}"\n\nFinancial Context:\n${JSON.stringify(context, null, 2)}`,
      systemInstruction,
    });

    if (aiText) {
      return res.json({ answer: aiText });
    }

    // Heuristic response if AI service is temporarily unavailable
    const totalSpend = expenses.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
    const totalBudget = budgets.reduce((sum: number, b: any) => sum + (Number(b.monthly_limit) || 0), 0);
    const qLower = question.toLowerCase();

    let answer = `Based on your ${expenses.length} tracked expenses, your total current spending is ${currencySymbol}${totalSpend.toFixed(2)}`;
    if (totalBudget > 0) {
      answer += ` against a combined budget allocation of ${currencySymbol}${totalBudget.toFixed(2)} (${Math.round((totalSpend / totalBudget) * 100)}% utilized).`;
    } else {
      answer += `.`;
    }

    if (qLower.includes('food') || qLower.includes('dining') || qLower.includes('eat')) {
      const foodCat = categories.find((c: any) => c.name.toLowerCase().includes('food'));
      const foodSpend = expenses
        .filter((e: any) => e.category_id === foodCat?.id)
        .reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
      answer += ` You have spent ${currencySymbol}${foodSpend.toFixed(2)} on Food & Dining.`;
    }

    answer += ` Try breaking down larger purchases into categorized weekly goals to optimize your monthly surplus!`;

    return res.json({ answer });
  } catch (error: any) {
    console.error('Error in /api/gemini/advisor:', error);
    return res.json({
      answer: `Your recorded total spend is ${req.body?.currencySymbol || '$'}${((req.body?.expenses || []).reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0)).toFixed(2)}. Continue tracking all your expenses to maintain clarity over your budget pacing.`,
    });
  }
});

// Vite middleware or static serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  startServer(DEFAULT_PORT);
}

start();

