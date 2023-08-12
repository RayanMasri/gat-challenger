

from telegram import Update, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes, MessageHandler
import re
import json
# async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # await context.bot.send_message(chat_id=update.effective_chat.id, text="I'm a bot, please talk to me!")


status_markup = ReplyKeyboardMarkup([[KeyboardButton('difficult')], [KeyboardButton('incorrect')]])
skill_markup = ReplyKeyboardMarkup([[KeyboardButton('verbal-analogy')], [KeyboardButton('contextual-error')], [KeyboardButton('sentence-completion')]])

def get_next_id():
    with open('../src/app/skills/data.json', 'r', encoding='utf8') as file:
        data = json.loads(file.read())

    questions = list(map(lambda model: model["questions"], data))
    questions = [subitem["id"] for item in questions for subitem in item]
    return list(sorted(questions, reverse=True))[0] + 1
        	
def complete_answers(answers):
    difference = 4 - len(answers)
    if difference <= 0: return answers

    return answers + (['...'] * difference)

application = ApplicationBuilder().token('6331627534:AAHKi5t_PBSmOzNKf9c781-ve1wbkH9d2AM').build()

async def on_message(update, context):
    poll = update.message['poll']
    if poll:
        explanation = None if poll['explanation'] == None else poll['explanation'].replace('\n', ' ')
        answers = list(map(lambda option: option['text'], poll['options']))
        answers = complete_answers(answers)
        correct = answers[poll['correct_option_id']]

        question = re.sub('.*\[.*\d+.*/.*\d+\.*]\s?', '', poll['question'])


        output = {
            "question": question,
            "answers": answers,
            "true": correct,
            "status": "new",
            "skill": "arbitrary",
            "id": get_next_id()
		}

        if explanation:
            output["notes"] = explanation

        # await update.message.reply_text(json.dumps(output, ensure_ascii=False))
        await update.message.chat.send_message("Question status", reply_markup=status_markup)
        # print(correct)
        # print(question)
        # print(explanation)


message_handler = MessageHandler(None, on_message)

# start_handler = CommandHandler('start', start)
application.add_handler(message_handler)

application.run_polling()