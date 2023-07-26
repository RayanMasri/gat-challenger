import math, pyperclip, json

with open('./made.txt', 'r', encoding='utf8') as file:
    data = file.read()

lines = data.split('\n')

dicts = []
line = 0
for i in range(int(math.floor(len(lines) / 5))):
    question = lines[line]
    answers = lines[line + 1:line + 5]

    question = question.replace('"', '')
    answers = list(map(lambda answer: answer.replace('"', ''), answers))

    dicts.append({
        "question": question,
        "answers": answers,
        "true": answers[0],
        "status": "missing"
    })
    line += 6

pyperclip.copy(json.dumps(dicts, ensure_ascii=False))