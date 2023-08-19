import json, re
from fuzzywuzzy import process

def parse_question(_question):
    question = re.sub('(\.)|(\s)|\:|"', "", _question["question"])
    answer = re.sub('(\.)|(\s)|\:|"', "", _question["true"])

    tag = question + answer

    tag = re.sub('أ|آ', "ا", tag)
    tag = re.sub('ة', "ه", tag)
    tag = re.sub('ئ|ى', "ي", tag)
    tag = re.sub('ؤ', "و", tag)

    return tag

def get_question_name(_question):
    question = re.sub('(\.)|(\s)|\:|"', "", _question["question"])
    return question


with open('./data.json', 'r', encoding='utf8') as file:
    data = json.loads(file.read())

name = "التعمية والتقويم"

comparisons = []
names = []


for model in data:
    if model["name"] != name:
        tags = list(map(parse_question, model["questions"]))
        comparisons += tags

        names += list(map(get_question_name, model["questions"]))


# print(comparisons)

model = next((model for model in data if model["name"] == name), None)
if model == None: print(f'Failed to find model by name "{name}"')

ratios = []

for question in model["questions"]:
    tag = parse_question(question)
    q = get_question_name(question)

    one_ratio = process.extract(tag, comparisons, limit=2)[0][1]
    two_ratio = process.extract(q, names, limit=2)[0][1]

    ratios.append([question, one_ratio + two_ratio])

ratios = list(sorted(ratios, key=lambda e: e[1]))

print(ratios)
    # if tag not in comparisons and q not in names:
        # print(question)

    # if tag not in comparisons:
        # print(question)


