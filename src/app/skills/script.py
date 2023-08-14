import json, re, pyperclip
with open('./data.json', 'r', encoding='utf8') as file:
    data = json.loads(file.read())

questions = [model["questions"] for model in data]
questions = [subitem for item in questions for subitem in item]


tags = {

}

def parse_question(_question):
    question = re.sub('(\.)|(\s)|\:|"', "", _question["question"])
    answer = re.sub('(\.)|(\s)|\:|"', "", _question["true"])

    tag = question + answer


    # if _question["skill"] != "sentence-completion": return ""

    return tag

for question in questions:
    tag = parse_question(question)
    # print(tag)
    if tag in list(tags.keys()):
        tags[tag] = tags[tag] + [question]
    else:
        tags[tag] = [question]

# del tags
print(len(question))
print(len(tags.keys()))
items = list(sorted(tags.items(), key=lambda e: len(e[1]), reverse=True))
# items = items[0:10]

x = ""
for i in range(len(items)):
    question = items[i][1][0]
    title = question["question"]
    answer = question["true"]
    x += f'{i + 1} - {title} ({answer}) - [{len(items[i][1])} تكرارات]\n'
    # print()

pyperclip.copy(x)

# questions = [question["question"]]