const GEMINI_API_KEYS = (import.meta.env.VITE_GEMINI_API_KEYS || '').split(',').filter(key => key.trim());
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function testApiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Say hello'
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 100,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Status ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0]) {
      return { success: true };
    }

    return { success: false, error: 'Invalid response structure' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function testAllApiKeys(): Promise<void> {
  console.log('Testing all API keys...');
  console.log('Total keys:', GEMINI_API_KEYS.length);

  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const key = GEMINI_API_KEYS[i];
    const maskedKey = key.substring(0, 10) + '...' + key.substring(key.length - 4);
    console.log(`Testing key ${i + 1}/${GEMINI_API_KEYS.length}: ${maskedKey}`);

    const result = await testApiKey(key);
    if (result.success) {
      console.log(`✓ Key ${i + 1} is working`);
    } else {
      console.error(`✗ Key ${i + 1} failed:`, result.error);
    }
  }

  console.log('API key testing complete');
}
