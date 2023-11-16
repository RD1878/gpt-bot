import { unlink } from 'fs/promises'
import { openai } from "./openai.js";

const users = {
    "Pavel": 972097851,
    "Olga_1": 942434545,
    "Olga_2": 5368804602,
    "Olga_3": 5861249750,
    "Grigorii": 6252764612,
}

export const INITIAL_SESSION = {
    messages: [],
}

const AUTHORIZED_USERS = Object.values(users);

export async function removeFile(path) {
    try {
        await unlink(path)
    } catch (e) {
        console.log('Error while removing file', e.message)
    }

}
export async function initCommand(ctx) {
    const userId = ctx.message?.from?.id;
    ctx.session = INITIAL_SESSION
    await ctx.reply(checkAccess(userId));
}
export async function processTextToChat(ctx, content) {
    try {
        ctx.session.messages.push({ role: openai.roles.USER, content });

        const response = await openai.chat(ctx.session.messages);

        ctx.session.messages.push({
            role: openai.roles.ASSISTANT,
            content: response.content,
        });
        await ctx.reply(response.content);
    } catch (e) {
        console.log('Error while proccesing text to gpt', e.message);
    }
}

export const checkAccess = (userId) => {
    const isUserAuthorized = (userId) => AUTHORIZED_USERS.includes(userId);

    if (!userId || !isUserAuthorized(userId)) {
        return 'Sorry! You have not access to this bot';
    }

    return 'Waiting for your request!';
}
