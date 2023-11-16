import config from 'config'
import { createReadStream } from 'fs'
import OpenAI from "openai";

class OpenAi {
    roles = {
        ASSISTANT: 'assistant',
        USER: 'user',
        SYSTEM: 'system',
    }

    constructor(apiKey) {
        this.openai = new OpenAI({
            apiKey
        })
    }

    async chat(messages) {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                // model: 'gpt-4-1106-preview',
                messages,
            })
            return response.choices[0].message
        } catch (e) {
            console.log('Error while gpt chat', e.message)
        }
    }

    async transcription(filepath) {
        try {
            const response = await this.openai.audio.transcriptions.create({
                model: 'whisper-1',
                file: createReadStream(filepath),
            });

            return response.text;
        } catch (e) {
            console.log('Error while transcription', e.message)
        }
    }
}

export const openai = new OpenAi(config.get('OPENAI_API_KEY'))
