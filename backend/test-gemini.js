import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testGeminiAPI() {
    try {
        console.log('Testing Gemini API...');

        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not found in environment variables');
        }

        console.log('API Key found:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Test different model names
        const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

        for (const modelName of modelNames) {
            try {
                console.log(`\nTesting model: ${modelName}`);

                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 100,
                    }
                });

                const result = await model.generateContent("Hello, please respond with 'API Working for " + modelName + "'");
                const response = await result.response;
                const text = response.text();

                console.log(`✅ Success with ${modelName}:`, text);
                break;

            } catch (error) {
                console.log(`❌ Failed with ${modelName}:`, error.message);
                continue;
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testGeminiAPI();
