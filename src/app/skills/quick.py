import json, re, pyperclip
with open('./data.json', 'r', encoding='utf8') as file:
    data = json.loads(file.read())
with open('../../../data/skills.json', 'r', encoding='utf8') as file:
    status = json.loads(file.read())

for i in range(len(data)):
    model = data[i]

    for j in range(len(model["questions"])):
        question = model["questions"][j]

        statuses = list(map(lambda e: e.strip(), question["status"].split('&&')))

        if "normal" in statuses:
            [wrongs, rights] = status[str(question["id"])]

            if wrongs > 0:
                data[i]["questions"][j]["status"] = "incorrect"
                # print(question["question"])

with open("./data-more.json", "a", encoding='utf8') as file:
    file.write(json.dumps(data, ensure_ascii=False))