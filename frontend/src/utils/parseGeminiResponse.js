/**
 * Safely parses JSON response from Gemini, removing any markdown code fences.
 * @param {string} text - Raw response text from Gemini API.
 * @param {any} fallback - Fallback value if parsing fails.
 * @returns {any}
 */
export const parseGeminiResponse = (text, fallback = {}) => {
  if (!text || typeof text !== 'string') return fallback;

  let cleaned = text.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '');
    cleaned = cleaned.replace(/\n?```$/, '');
    cleaned = cleaned.trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("[ERROR] parseGeminiResponse: Failed to parse Gemini JSON:", error, "Raw text:", text);
    
    // Attempt to extract JSON from inside curly braces or brackets if string is malformed
    const match = cleaned.match(/\{[\s\S]*\}/) || cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerError) {
        console.error("[ERROR] parseGeminiResponse: Inner regex parsing also failed:", innerError);
      }
    }
    return fallback;
  }
};
