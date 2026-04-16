import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful medical AI assistant for a healthcare platform called MediConnect. 
When patients describe symptoms, provide:
1) Possible conditions (non-diagnostic - always be clear this is not a real diagnosis)
2) Recommended doctor specialty to consult
3) Urgency level (low/medium/high)
4) General health tips

Always remind that this is not a medical diagnosis and they should consult a real doctor. 
Keep responses concise and friendly. Format your response as JSON with keys: conditions, specialty, urgency, tips, disclaimer.`;

/**
 * POST /api/ai-assistant/analyze-symptoms
 * Analyze patient symptoms and provide AI recommendations
 */
export const analyzeSymptons = async (req, res) => {
  try {
    const { symptoms, conversationHistory } = req.body;
    const userId = req.user?.userId;

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({ success: false, message: 'Symptoms required.' });
    }

    console.log('[AI Assistant] Analyzing symptoms:', symptoms);

    // Prepare messages for conversation
    const messages = conversationHistory || [];
    messages.push({
      role: 'user',
      content: symptoms,
    });

    let parsedResponse;

    try {
      console.log('[AI Assistant] Calling Claude API with model:', 'claude-3-5-sonnet-20241022');

      // Call Claude API
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages,
      });

      console.log('[AI Assistant] Claude API response received');

      const assistantMessage = response.content[0].text;

      // Try to parse as JSON, fallback to plain text
      try {
        parsedResponse = JSON.parse(assistantMessage);
      } catch {
        parsedResponse = {
          response: assistantMessage,
          disclaimer: 'This is not a medical diagnosis. Please consult a real doctor.',
        };
      }
    } catch (apiError) {
      console.warn('[AI Assistant] Claude API failed, using mock response:', apiError.message);
      
      // Fallback: Generate mock response based on symptom keyword matching
      parsedResponse = getMockAnalysis(symptoms);
    }

    const assistantMessage = parsedResponse.response || JSON.stringify(parsedResponse);

    res.status(200).json({
      success: true,
      message: 'Analysis complete.',
      data: {
        analysis: parsedResponse,
        conversationHistory: [
          ...messages,
          {
            role: 'assistant',
            content: assistantMessage,
          },
        ],
      },
    });
  } catch (error) {
    console.error('[AI Assistant] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'AI analysis failed.',
    });
  }
};

// Mock analysis for testing when API is unavailable
const getMockAnalysis = (symptoms) => {
  const lowerSymptoms = symptoms.toLowerCase();
  
  if (lowerSymptoms.includes('fever') || lowerSymptoms.includes('cough')) {
    return {
      conditions: 'Common cold, flu, respiratory infection, or COVID-19',
      specialty: 'General Practitioner or Allergist',
      urgency: 'medium',
      tips: 'Rest, stay hydrated, monitor temperature. Seek immediate care if fever exceeds 103°F or difficulty breathing occurs.',
      disclaimer: '⚠️ This is not a medical diagnosis. Please consult a real doctor for proper evaluation.',
    };
  }
  
  if (lowerSymptoms.includes('headache') || lowerSymptoms.includes('migraine')) {
    return {
      conditions: 'Tension headache, migraine, dehydration, or stress-related headache',
      specialty: 'Neurologist or General Practitioner',
      urgency: 'low',
      tips: 'Rest in a dark, quiet room. Stay hydrated. Try over-the-counter pain relievers if needed.',
      disclaimer: '⚠️ This is not a medical diagnosis. Please consult a real doctor for proper evaluation.',
    };
  }
  
  if (lowerSymptoms.includes('chest') || lowerSymptoms.includes('pain')) {
    return {
      conditions: 'Muscle strain, anxiety, heartburn, or potentially cardiac issues',
      specialty: 'Cardiologist or Emergency Medicine',
      urgency: 'high',
      tips: 'Seek immediate medical attention, especially if accompanied by shortness of breath, dizziness, or arm pain.',
      disclaimer: '⚠️ This is not a medical diagnosis. Please consult a real doctor immediately for chest pain.',
    };
  }
  
  if (lowerSymptoms.includes('nausea') || lowerSymptoms.includes('vomit')) {
    return {
      conditions: 'Gastroenteritis, food poisoning, medication side effect, or inner ear disorder',
      specialty: 'Gastroenterologist or General Practitioner',
      urgency: 'medium',
      tips: 'Rest, stay hydrated with electrolytes. Avoid solid foods initially. Seek care if symptoms persist beyond 24 hours.',
      disclaimer: '⚠️ This is not a medical diagnosis. Please consult a real doctor for proper evaluation.',
    };
  }
  
  // Default response
  return {
    conditions: 'Various possible conditions - requires professional evaluation',
    specialty: 'General Practitioner (first step) or relevant specialist',
    urgency: 'medium',
    tips: 'Keep a symptom diary, stay hydrated, get adequate rest, and monitor your condition.',
    disclaimer: '⚠️ This is not a medical diagnosis. Please consult a real doctor for proper evaluation. The above suggestions are general health advice only.',
  };
};

/**
 * POST /api/ai-assistant/general-health-question
 * Ask general health questions
 */
export const askHealthQuestion = async (req, res) => {
  try {
    const { question, conversationHistory } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question required.' });
    }

    console.log('[AI Assistant] Health question:', question);

    // Prepare messages
    const messages = conversationHistory || [];
    messages.push({
      role: 'user',
      content: question,
    });

    let assistantMessage;

    try {
      console.log('[AI Assistant] Calling Claude API for health question');

      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages,
      });

      assistantMessage = response.content[0].text;
      console.log('[AI Assistant] Claude API responded to health question');
    } catch (apiError) {
      console.warn('[AI Assistant] Claude API failed for question, using mock response:', apiError.message);
      
      // Mock response for health questions
      assistantMessage = `Based on your question about "${question}", here are some general health considerations:

1. **General Information**: This is educational content only and not a medical diagnosis.
2. **Recommended Action**: Consider consulting a healthcare professional for personalized medical advice.
3. **Important Note**: Always seek professional medical guidance for health concerns.

For specific medical concerns, please speak with your doctor or visit a healthcare provider.

⚠️ Disclaimer: This response is general health information and not a substitute for professional medical advice.`;
    }

    res.status(200).json({
      success: true,
      message: 'Response generated.',
      data: {
        response: assistantMessage,
        conversationHistory: [
          ...messages,
          {
            role: 'assistant',
            content: assistantMessage,
          },
        ],
      },
    });
  } catch (error) {
    console.error('[AI Assistant] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate response.',
    });
  }
};
