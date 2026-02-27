import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserData } from './storage';

export const getGeminiModel = async (modelName: string = 'gemini-1.5-flash') => {
    const userData = await getUserData();
    if (!userData?.apiKey) {
        throw new Error('API Key not found. Please go to settings.');
    }

    const genAI = new GoogleGenerativeAI(userData.apiKey);
    return genAI.getGenerativeModel({ model: modelName });
};

export const fileToGenerativePart = async (uri: string, mimeType: string) => {
    const response = await fetch(uri);
    const data = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = (reader.result as string).split(',')[1];
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType,
                },
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(data);
    });
};
