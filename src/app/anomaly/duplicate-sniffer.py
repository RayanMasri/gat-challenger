import json

with open('./data.json', 'r', encoding='utf8') as file:
    data = json.loads(file.read())


x = []

for question in data:
    solution = question["solution"]

    if solution == None: continue
    
    answers = list(map(lambda e: e["content"], question["answers"]))
    answers = '-'.join(list(sorted(answers)))
    # answers = '-'.join(answers)

    _id = answers + '-' + solution

    x.append(_id)

    if _id in x:
        repetitions = x.count(_id)
        if repetitions > 1:
            print(f'ID "${_id}" has {repetitions} duplicate(s)')

# print(len(x))
# print(list(enumerate(x)))
# x = list(filter(lambda e: x.index(e[1]) == e[0], list(enumerate(x))))[1]

# print(len(x))

