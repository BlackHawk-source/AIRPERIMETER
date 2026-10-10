import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { calculatePerimeterSecurity, parseAndTroubleshootLog } from './src/utils/airportAnalyzer.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI if a valid key is present
const apiKey = process.env.GEMINI_API_KEY;
const isRealApiKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 10);
const ai = isRealApiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper to run promise with timeout
function withTimeout<T>(promise: Promise<T>, ms: number = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI request timed out')), ms))
  ]);
}

// API: Analyze Perimeter with Airport Metaphor
app.post('/api/analyze-perimeter', async (req, res) => {
  try {
    const { config } = req.body;
    if (!config) {
      return res.status(400).json({ error: 'Missing perimeter configuration' });
    }

    if (!ai) {
      // Return helpful fallback message indicating key is not yet set
      return res.json({
        usingGemini: false,
        message: 'Running local heuristic analysis engine (GEMINI_API_KEY not configured)'
      });
    }

    const prompt = `You are the lead architect for AeroSC: Airport Security VPC Architect.
Analyze the following Google Cloud VPC Service Controls configuration using an engaging, accessible Airport Security metaphor.

Perimeter Data:
- Name: "${config.name}"
- Mode: ${config.enforcementMode}
- Projects Protected (Airport Concourses): ${JSON.stringify(config.projects)}
- Restricted Services (Locked Aircraft Vaults): ${JSON.stringify(config.restrictedServices)}
- Ingress Rules (Boarding Gates & VIP Passes): ${JSON.stringify(config.ingressRules)}
- Egress Rules (Duty-Free Customs & Export): ${JSON.stringify(config.egressRules)}

Return a valid JSON object matching this schema:
{
  "securityScore": number (0 to 100),
  "rating": string (e.g. "Class A+ Fortress Airport"),
  "summary": string (concise plain-English technical overview),
  "metaphorNarrative": string (vivid airport story explaining who can enter, which vaults are locked, and what happens at the gates),
  "strengths": string[] (list of 3 key defenses),
  "vulnerabilities": string[] (list of 2-3 potential risks or gaps),
  "recommendations": string[] (list of 2-3 concrete steps to strengthen security)
}

Important: Return ONLY valid JSON without markdown fences.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      }),
      8000
    );

    const text = response.text || '{}';
    const jsonResult = JSON.parse(text);
    return res.json({
      usingGemini: true,
      analysis: jsonResult
    });
  } catch (error: any) {
    console.warn('Gemini analyze fallback to local airport engine:', error.message);
    const fallback = calculatePerimeterSecurity(req.body.config);
    return res.json({
      usingGemini: false,
      analysis: fallback,
      note: 'Analyzed with local airport security engine'
    });
  }
});

// API: Troubleshoot Log with Airport Metaphor
app.post('/api/troubleshoot-log', async (req, res) => {
  try {
    const { rawLog } = req.body;
    if (!rawLog) {
      return res.status(400).json({ error: 'Missing rawLog string' });
    }

    if (!ai) {
      const fallback = parseAndTroubleshootLog(rawLog);
      return res.json({
        usingGemini: false,
        result: fallback
      });
    }

    const prompt = `You are the customs security officer at AeroSC: Airport Security VPC Architect.
Diagnose this raw Google Cloud VPC Service Controls Audit / Dry-Run Log using our airport security checkpoint metaphor.

Raw GCP Log:
${rawLog}

Analyze:
1. Who was the traveler (principalEmail)?
2. Where did they come from (callerIp)?
3. What vault/aircraft did they try to reach (serviceName / resourceName)?
4. Why did the checkpoint buzzer sound (violationReason)?
5. Explain what happened in a friendly airport metaphor.
6. Provide the exact recommended fix.

Return a valid JSON object matching this schema:
{
  "denied": boolean,
  "principal": string,
  "callerIp": string,
  "serviceRequested": string,
  "projectTargeted": string,
  "violationType": string,
  "humanExplanation": string,
  "airportMetaphorDiagnosis": string,
  "recommendedAction": string,
  "fixActionType": "ADD_IP" | "ADD_SERVICE_ACCOUNT" | "ADD_SERVICE" | "SWITCH_DRY_RUN",
  "fixPayload": {
    "ipToAdd": string (optional, e.g. "198.51.100.45/32"),
    "identityToAdd": string (optional, e.g. "user:alice@example.com"),
    "serviceToAdd": string (optional)
  }
}

Important: Return ONLY valid JSON without markdown fences.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      }),
      8000
    );

    const text = response.text || '{}';
    const jsonResult = JSON.parse(text);
    return res.json({
      usingGemini: true,
      result: jsonResult
    });
  } catch (error: any) {
    console.warn('Gemini troubleshoot fallback to local engine:', error.message);
    const fallback = parseAndTroubleshootLog(req.body.rawLog || '');
    return res.json({
      usingGemini: false,
      result: fallback,
      note: 'Diagnosed with local customs inspector engine'
    });
  }
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✈️ AeroSC server ready at http://0.0.0.0:${PORT}`);
  });
}

startServer();
