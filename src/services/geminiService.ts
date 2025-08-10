import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserProfile, Message } from '../types';

// Note: In production, this should be in environment variables
const apiKey = ''; // Will be set via initializeGemini

let genAI: GoogleGenerativeAI | null = null;

export const initializeGemini = (apiKey: string) => {
  try {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API key is required');
    }
    genAI = new GoogleGenerativeAI(apiKey);
    return true;
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
    return false;
  }
};

export const generateResponse = async (
  messages: Message[],
  userProfile: UserProfile,
  condition?: string
): Promise<string> => {
  if (!genAI) {
    throw new Error('Gemini AI not initialized. Please check your API key configuration.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const context = `You are a helpful AI health assistant for symptom tracking. 
User Profile: Age: ${userProfile.age || 'not specified'}, Gender: ${userProfile.gender || 'not specified'}
${condition ? `Current condition being discussed: ${condition}` : ''}

IMPORTANT GUIDELINES:
- Never recommend specific medications or prescribe treatments
- Always encourage consulting with healthcare professionals
- Focus on symptom tracking, lifestyle recommendations, and general health information
- Provide supportive, empathetic responses
- Ask follow-up questions to better understand symptoms
- Suggest keeping detailed records for healthcare providers
- For report generation requests, summarize symptoms and patterns clearly
- If something off-topic arises, gently steer the conversation back to the user's health concerns. Don't answer off-topic questions.
- Don't add date while generating report
- Most important, reply in the language in which the user is communicating. Default is english.
- Your AI prompts should be brief and up to mark, and give proper formatting in bullet points
- Remember, I'm not a medical professional, and this information isn't a substitute for medical advice. It's always best to consult with a doctor or other qualified healthcare provider to get an accurate diagnosis and treatment plan., Say this only if asked
- How would you rate the pain on a scale of 1 to 10, with 1 being mild and 10 being the worst pain you've ever experienced?, Dont ask such stupid questions, How will someone rate the pain, dont ask for pain level

Previous conversation context:
${messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

Please respond helpfully while adhering to these guidelines.`;

  const currentMessage = messages[messages.length - 1];
  const prompt = `${context}\n\nUser: ${currentMessage.content}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    if (!text) {
      throw new Error('Empty response from AI');
    }
    return text;
  } catch (error) {
    console.error('Error generating response:', error);
    if (error instanceof Error) {
      throw new Error(`AI Response Error: ${error.message}`);
    }
    throw new Error('Failed to generate AI response');
  }
};

export const generateReport = async (
  messages: Message[],
  userProfile: UserProfile,
  condition?: string
): Promise<string> => {
  if (!genAI) {
    throw new Error('Gemini AI not initialized. Please check your API key configuration.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Generate a comprehensive health report based on the following symptom tracking data:

User Profile: Age: ${userProfile.age || 'not specified'}, Gender: ${userProfile.gender || 'not specified'}
${condition ? `Condition: ${condition}` : ''}

Conversation History:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Please create a detailed report that includes:
1. Summary of reported symptoms
2. Patterns and trends observed
3. Key dates and symptom progression
4. Suggested questions to ask healthcare providers
5. Lifestyle factors mentioned
6. Overall health tracking summary
7. And do not allow AI to mention Date
8. And generate PDF in english, whatsoever be the patient language in the chat
9. And if present, mention the age and gender of the person in the report, else dont even mention it
10. And don't dare to mention that you're an AI model, the report shoould look like human made

Format the report professionally for presentation to healthcare providers.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    if (!text) {
      throw new Error('Empty response from AI');
    }
    return text;
  } catch (error) {
    console.error('Error generating report:', error);
    if (error instanceof Error) {
      throw new Error(`Report Generation Error: ${error.message}`);
    }
    throw new Error('Failed to generate report');
  }
};