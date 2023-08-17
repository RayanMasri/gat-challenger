

from telegram import ReplyKeyboardMarkup, ReplyKeyboardRemove, Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes, MessageHandler
import re
import json, time

# Poll 1 ( Quiz Bot )
# Poll(allows_multiple_answers=False, correct_option_id=0, id='5391246905051187237', is_anonymous=False, is_closed=True, options=(PollOption(text='ماليزيا : اسيا', voter_count=1), PollOption(text='شمال : قطب', voter_count=0), PollOption(text='اعتدال : ربيع', voter_count=0), PollOption(text='شمس : حرارة', voter_count=0)), question='[6/11] جنين : بطن الأم', total_voter_count=1, type=<PollType.QUIZ>)
# Message(channel_chat_created=False, chat=Chat(api_kwargs={'all_members_are_administrators': True}, id=-982401522, title='Me', type=<ChatType.GROUP>), date=datetime.datetime(2023, 8, 15, 18, 26, 54, tzinfo=<UTC>), delete_chat_photo=False, forward_date=datetime.datetime(2023, 8, 14, 13, 32, 29, tzinfo=<UTC>), forward_from=User(first_name='Quiz Bot', id=983000232, is_bot=True, username='QuizBot'), from_user=User(first_name='Mhmod', id=6338210162, is_bot=False, language_code='en'), group_chat_created=False, message_id=241, poll=Poll(allows_multiple_answers=False, correct_option_id=0, id='5391246905051187237', is_anonymous=False, is_closed=True, options=(PollOption(text='ماليزيا : اسيا', voter_count=1), PollOption(text='شمال : قطب', voter_count=0), PollOption(text='اعتدال : ربيع', voter_count=0), PollOption(text='شمس : حرارة', voter_count=0)), question='[6/11] جنين : بطن الأم', total_voter_count=1, type=<PollType.QUIZ>), supergroup_chat_created=False)
# Poll 2:
# Poll( allows_multiple_answers=False, id='5972133432174575871', is_anonymous=True, is_closed=False, options=(PollOption(text='الوصول - دمارا', voter_count=0), PollOption(text='..', voter_count=0), PollOption(text='...', voter_count=0)), question='٧📙 الأعاصير تحدث فوق المحيطات عند ... لليابسة تحدث .... كبيرا', total_voter_count=179, type=<PollType.QUIZ>)
# Message(channel_chat_created=False, chat=Chat(api_kwargs={'all_members_are_administrators': True}, id=-982401522, title='Me', type=<ChatType.GROUP>), date=datetime.datetime(2023, 8, 15, 18, 26, 54, tzinfo=<UTC>), delete_chat_photo=False, forward_date=datetime.datetime(2023, 8, 15, 18, 19, 1, tzinfo=<UTC>), forward_from_chat=Chat(id=-1001175204955, title='أبدع بقدراتك - قدرات 💜', type=<ChatType.CHANNEL>, username='AbdihQT'), forward_from_message_id=21460, forward_signature='~', from_user=User(first_name='Mhmod', id=6338210162, is_bot=False, language_code='en'), group_chat_created=False, message_id=240, poll=Poll(allows_multiple_answers=False, id='5972133432174575872', is_anonymous=True, is_closed=False, options=(PollOption(text='فعل - مصايد', voter_count=0), PollOption(text='كثرة - وسوسة', voter_count=0), PollOption(text='تنوع -فخ', voter_count=0)), question='٨📙 تنوع الأمة الاسلامية بـ.. ...أخطاء شبابها الذين وقعوا في ... ..الشيطان.', total_voter_count=182, type=<PollType.QUIZ>), supergroup_chat_created=False)

# anomaly = False

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

def parse_poll(message, addition=0, anomaly=False, skill=None):
    poll = message['poll']
    explanation = None if poll['explanation'] == None else poll['explanation'].replace('\n', ' ')
    answers = list(map(lambda option: option['text'], poll['options']))
    answers = complete_answers(answers)
    correct_index = poll['correct_option_id']
    correct = answers[correct_index] if correct_index else ""

    question = re.sub('.*\[.*\d+.*/.*\d+\.*]\s?', '', poll['question'])



    output = {
        "question": question,
        "answers": answers,
        "true": correct,
        "status": "new",
        "skill": "arbitrary" if skill == None else skill,
        "id": get_next_id() + addition
    } if not anomaly else {
        "answers": list(map(lambda e: { "content": e, "meaning": (explanation if explanation else "")if e.strip() == correct.strip() else "" }, answers)),
        "solution": correct
    }

    if explanation:
        output["notes"] = explanation

    return output
    # await update.message.reply_text(json.dumps(output, ensure_ascii=False))
        
        # print(correct)
        # print(question)
        # print(explanation)

application = ApplicationBuilder().token('6331627534:AAHKi5t_PBSmOzNKf9c781-ve1wbkH9d2AM').build()


messages = []
async def on_message(update, context):
    global messages
    poll = update.message['poll']

    if poll:
        messages.append(update.message)
        print(f'Added message to messages and became {len(messages)}')


async def on_parse(update, context):
    # print('parsing')
    global messages
    print(f'Parsing {len(messages)}')

    for i in range(len(messages)):
        message = messages[i]
        reply = await message.reply_text(
            "Is this an anomaly question?",
            reply_markup=ReplyKeyboardMarkup(
                [["Yes", "No"]], one_time_keyboard=True, input_field_placeholder=f"Question {i}"
            )
        )

        print(reply)

        # print(message)
    # messages = messages
    # msgs

    messages = []

    # if poll:



message_handler = MessageHandler(None, on_message)
command_handler = CommandHandler("parse", on_parse)

application.add_handlers({
    0 : [message_handler],
    1 : [command_handler]
})

    # conv_handler = ConversationHandler(
    #     entry_points=[CommandHandler("start", start)],
    #     states={
    #         GENDER: [MessageHandler(filters.Regex("^(Boy|Girl|Other)$"), gender)],
    #         PHOTO: [MessageHandler(filters.PHOTO, photo), CommandHandler("skip", skip_photo)],
    #         LOCATION: [
    #             MessageHandler(filters.LOCATION, location),
    #             CommandHandler("skip", skip_location),
    #         ],
    #         BIO: [MessageHandler(filters.TEXT & ~filters.COMMAND, bio)],
    #     },
    #     fallbacks=[CommandHandler("cancel", cancel)],
    # )

    # application.add_handler(conv_handler)
# start_handler = CommandHandler('start', start)

application.run_polling()