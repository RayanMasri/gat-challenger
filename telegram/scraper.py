

from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes, MessageHandler
import re
import json
# async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # await context.bot.send_message(chat_id=update.effective_chat.id, text="I'm a bot, please talk to me!")

anomaly = True

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


	# {
	# 	"answers": [
	# 		{ "content": "ألم", "meaning": "" },
	# 		{ "content": "كمد", "meaning": "حزِن حُزْنًا شديدًا" },
	# 		{ "content": "حزن", "meaning": "" },
	# 		{ "content": "حبور", "meaning": " سروراً، فَرَحاً، بَهْجَةً،" }
	# 	],
	# 	"solution": "حبور"
	# },

        output = {
            "question": question,
            "answers": answers,
            "true": correct,
            "status": "new",
            "skill": "arbitrary",
            "id": get_next_id()
		} if not anomaly else {
            "answers": list(map(lambda e: { "content": e, "meaning": (explanation if explanation else "")if e.strip() == correct.strip() else "" }, answers)),
            "solution": correct
        }

        if explanation:
            output["notes"] = explanation
        await update.message.reply_text(json.dumps(output, ensure_ascii=False))
        
        # print(correct)
        # print(question)
        # print(explanation)


message_handler = MessageHandler(None, on_message)

# start_handler = CommandHandler('start', start)
application.add_handler(message_handler)

application.run_polling()