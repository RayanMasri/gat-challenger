import json, re, pyperclip
with open('./data.json', 'r', encoding='utf8') as file:
    data = json.loads(file.read())

questions = [model["questions"] for model in data]
questions = [subitem for item in questions for subitem in item]

unchosen_all = {

}

chosen = []

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
print(clean("طائرة : راكب"))
for question in questions:
    if ':' not in question['true']: continue
    [title, answer, answers] = parse_question(question)


    chosen.append(answer)

    for i in range(len(answers)):
        unchosen_answer = answers[i]
        if unchosen_answer in chosen or unchosen_answer == answer: continue
        if unchosen_answer not in list(unchosen_all.keys()):
            # if unchosen_answer != clean(question["answers"][i]):
            #     print(unchosen_answer)
            #     print(question["answers"][i])
            #     print(answers)
            #     print(list(map(clean, question["answers"])))
            #     print(question["answers"])
            unchosen_all[unchosen_answer] = [1, question["answers"][i]]
        else:
            alloted = unchosen_all[unchosen_answer]
            
            unchosen_all[unchosen_answer] = [alloted[0] + 1, alloted[1]]

# Remove chosen
print(len(list(unchosen_all.keys())))
keys = list(unchosen_all.keys())
for i in range(len(keys)):
    if keys[i] in chosen:
        del unchosen_all[keys[i]]
    
print(len(list(unchosen_all.keys())))
print("طايرةراكب" in chosen)
print("طايرةراكب" in list(unchosen_all.keys()))
with open('johncena.json', 'w', encoding='utf8') as file:
    file.write(json.dumps(unchosen_all, ensure_ascii=False))
string = ""

result = sorted(list(unchosen_all.values()), key=lambda e: e[0], reverse=True)

for item in result:
    string += f'"{item[1]}" - مكرر {item[0]}\n'

pyperclip.copy(string)