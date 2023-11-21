import json, re, pyperclip
with open('./data.json', 'r', encoding='utf8') as file:
    data = json.loads(file.read())

questions = [model["questions"] for model in data]
questions = [subitem for item in questions for subitem in item]


def clean(text):
    text = re.sub('[أاآ]', "ا", text)
    text = re.sub('[ةه]', "ة", text)
    text = re.sub('[ئيى]', "ي", text)
    return re.sub('(\.)|(\s)|\:|"|-', "", text)

def parse_question(_question):

    question = clean(_question["question"])
    answer = clean(_question["true"])

    answers = list(map(clean, _question["answers"]))

    return [question, answer, answers]


occurences = {}
for question in questions:
    [title, answer, answers] = parse_question(question)

    phrase = title + answer + ''.join(sorted(answers))


    if phrase in list(occurences.keys()):
        occurences[phrase] += [question]
    else:
        occurences[phrase] = [question]

def remove_question(identifier):
    for model in data:
        result = list(filter(lambda e: e[1]["id"] == identifier, list(enumerate(model["questions"]))))
        if len(result) == 0: continue

        index = result[0][0]
        del model['questions'][index]
        break


for [_, duplicates] in list(occurences.items()):
    if len(duplicates) == 1: continue
    cull = []
    for duplicate in duplicates:
        if "notes" not in list(duplicate.keys()) and duplicate["status"] in ["missing", "new", "normal"]:
            cull.append(duplicate["id"])

    cull = sorted(cull)

    if len(cull) == 0: continue

    if len(cull) == len(duplicates):
        cull = cull[0:-1]

    for identifier in cull:
        remove_question(identifier)

print(len(questions))

questions = [model["questions"] for model in data]
questions = [subitem for item in questions for subitem in item]

print(len(questions))

pyperclip.copy(json.dumps(data, ensure_ascii=False))