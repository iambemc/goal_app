import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateVideoPrompt = async (answers: string[]): Promise<string> => {
    const prompt = `
        You are a creative assistant that writes short, vivid video prompts for an AI video generator.
        Based on the user's answers to a questionnaire about their goals, create a single, compelling prompt.
        The prompt should describe a short, cinematic video clip of a person, representing the user, achieving their goal.
        The person should be the central focus. Describe their action and emotion vividly. Keep it concise, under 50 words.
        Do not use any special characters or markdown.
        
        Here are the user's answers:
        1. Goal: ${answers[0]}
        2. Importance: ${answers[1]}
        3. Environment: ${answers[2]}
        4. Action: ${answers[3]}
        5. Emotion: ${answers[4]}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating video prompt:", error);
        throw new Error("Failed to generate a creative prompt for your goal.");
    }
};

interface UserImagePayload {
    data: string;
    mimeType: string;
}

export const generateGoalVideo = async (
    prompt: string, 
    userImages: UserImagePayload[],
    updateLoadingMessage: (message: string) => void
): Promise<string> => {
    try {
        if (userImages.length < 2) {
            throw new Error("At least two images are required for a stable video generation.");
        }

        updateLoadingMessage("Creating a stable image representation...");

        // Step 1: Create a composite image for better face stability
        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { inlineData: { data: userImages[0].data, mimeType: userImages[0].mimeType } },
                    { inlineData: { data: userImages[1].data, mimeType: userImages[1].mimeType } },
                    { text: 'From these two images, create a single, clear, front-facing portrait. This will be used to generate a video, so the face must be stable and high-quality.' },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const imagePart = imageResponse.candidates?.[0]?.content?.parts.find(part => part.inlineData);
        if (!imagePart?.inlineData) {
            throw new Error("Failed to create a composite image from the selfies.");
        }
        const compositeImageBase64 = imagePart.inlineData.data;
        const compositeImageMimeType = imagePart.inlineData.mimeType || 'image/png';
        
        updateLoadingMessage("Image representation created. Generating video...");

        // Step 2: Generate video using the composite image
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            image: {
                imageBytes: compositeImageBase64,
                mimeType: compositeImageMimeType,
            },
            config: {
                numberOfVideos: 1
            }
        });

        const MAX_POLL_ATTEMPTS = 30; // 5 minutes timeout (30 * 10s)
        let pollCount = 0;
        while (!operation.done && pollCount < MAX_POLL_ATTEMPTS) {
            updateLoadingMessage(`Checking video status... (Attempt ${pollCount + 1}/${MAX_POLL_ATTEMPTS})`);
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
            pollCount++;
        }

        if (!operation.done) {
            throw new Error("Video generation timed out after 5 minutes. Please try again.");
        }
        
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }
        
        updateLoadingMessage("Video generated! Downloading...");
        
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            throw new Error(`Failed to download video. Status: ${videoResponse.statusText}`);
        }
        
        const videoBlob = await videoResponse.blob();
        return URL.createObjectURL(videoBlob);

    } catch (error) {
        console.error("Error generating video:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unexpected error occurred during video generation.");
    }
};
