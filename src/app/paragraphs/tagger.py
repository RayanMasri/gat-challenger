import json

with open('./data.json', 'r', encoding='utf8') as file:
    data = json.loads(file.read())

total = 0
for i in range(len(data)):
    edited = data[i]

    questions = edited["questions"]

    for j in range(len(questions)):
        questions[j]["id"] = total
        total += 1

    edited["questions"] = questions

    data[i] = edited

with open('./new-data.json', 'a', encoding='utf8') as file:
    file.write(json.dumps(data, ensure_ascii=False))