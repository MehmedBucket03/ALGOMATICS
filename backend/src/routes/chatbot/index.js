// backend/src/routes/chatbot/index.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Helper function to format messages for the model
function formatMessagesForModel(messages) {
    let prompt = '';

    // Check if there's a system message
    const systemMessage = messages.find(msg => msg.role === 'system');
    if (systemMessage) {
        // Mistral-7B-Instruct-v0.3 handles system messages in the chat format
        prompt += `<s>[INST] ${systemMessage.content} [/INST]\n\n`;
    } else {
        // Add a default system message if none exists
        prompt += `<s>[INST] You are a helpful, respectful assistant. Answer the user's questions based on your knowledge. [/INST]\n\n`;
    }

    // Process conversation messages (skipping the system message we already handled)
    let conversationStarted = false;

    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        if (message.role === 'system') continue; // Skip system message as we've already added it

        if (message.role === 'user') {
            if (conversationStarted) {
                // For continuing conversations in Mistral-7B-Instruct-v0.3
                prompt += `[INST] ${message.content} [/INST]`;
            } else {
                // First user message after system message
                prompt += `[INST] ${message.content} [/INST]`;
                conversationStarted = true;
            }
        } else if (message.role === 'assistant') {
            prompt += `${message.content}`;
        }
    }

    return prompt;
}

// Chat endpoint
router.post('/', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Invalid message format' });
        }

        // Format messages for Hugging Face API
        const formattedPrompt = formatMessagesForModel(messages);

        // Make request to Hugging Face Inference API
        const response = await axios.post(
            `https://api-inference.huggingface.co/models/${process.env.HF_MODEL_ID || 'mistralai/Mistral-7B-Instruct-v0.3'}`,
            { inputs: formattedPrompt },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HF_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000 // 60 second timeout for model inference
            }
        );

        // Extract the generated text from the response
        let assistantResponse = '';
        if (response.data && response.data[0] && response.data[0].generated_text) {
            // Extract just the new content (remove the prompt)
            const fullResponse = response.data[0].generated_text;

            // Find where the assistant's response starts (after the last [/INST] tag)
            const lastInstEnd = fullResponse.lastIndexOf('[/INST]');
            if (lastInstEnd !== -1) {
                assistantResponse = fullResponse.substring(lastInstEnd + 7).trim();
            } else {
                assistantResponse = fullResponse.substring(formattedPrompt.length).trim();
            }

            // If the response continues with a new user message, trim it off
            const nextUserMsgStart = assistantResponse.indexOf('[INST]');
            if (nextUserMsgStart !== -1) {
                assistantResponse = assistantResponse.substring(0, nextUserMsgStart).trim();
            }
        } else {
            assistantResponse = response.data;
        }

        res.json({
            message: {
                role: 'assistant',
                content: assistantResponse
            }
        });
    } catch (error) {
        console.error('Error with Hugging Face API:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Failed to process chat request',
            details: process.env.NODE_ENV === 'development' ? (error.message || 'Unknown error') : undefined
        });
    }
});

module.exports = router;