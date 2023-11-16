import {Telegraf, session} from 'telegraf'
import { message } from "telegraf/filters";
import config from 'config'
import { ogg } from "./ogg.js";
import { initCommand, INITIAL_SESSION, processTextToChat, removeFile } from "./utils.js";
import { openai } from "./openai.js";

const bot = new Telegraf(config.get('TELEGRAM_BOT_TOKEN'));

bot.use(session());

bot.command('new', initCommand);
bot.command('start', initCommand);
// bot.command('stop', (ctx) => {
//       bot.stop();
//       ctx.reply('Bot stopped');
// })

bot.on(message('voice'), async (ctx) => {
   ctx.session ??= INITIAL_SESSION;

   try {
      const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
      const userId = `${ctx.message.from.id}`;
      console.log(userId)
      const oggPath = await ogg.create(link.href, userId);
      const mp3Path = await ogg.toMp3(oggPath, userId);

      const text = await openai.transcription(mp3Path);

      await removeFile(mp3Path);

      const messages = [{role: openai.roles.USER, content: text}];
      await openai.chat(messages);
      await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
      await processTextToChat(ctx, text)
   } catch (e) {
      console.log(`Error while voice message`, e.message);
   }
});

bot.on(message('text'), async (ctx) => {
   ctx.session ??= INITIAL_SESSION
   try {
      await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
      await processTextToChat(ctx, ctx.message.text)
   } catch (e) {
      console.log(`Error while voice message`, e.message)
   }
})

bot.launch();


process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
