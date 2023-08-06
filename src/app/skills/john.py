from bs4 import BeautifulSoup
import requests
import pyperclip
import json


def acquire_solution(url):
    response = requests.post(url, data={ 'success_percentage': '50' })
    content =response.content.decode('utf8')

    soup = BeautifulSoup(content)

    data = []

    for cluster in soup.select('.form-group.row'):
        question = cluster.select_one('div.question .pre').get_text().strip()
        true_answer = cluster.select_one('.form-check > .answer').get_text()

        true_answer = list(filter(lambda e: e, true_answer.strip().split('الاجابة الصحيحة هي :')))[0].strip()

        data.append({
            "question": question,
            "true": true_answer
        })
    return data

with open('data.json', 'r', encoding='utf8') as file:
    data = json.loads(file.read())
with open('john.json', 'r', encoding='utf8') as file:
    urls = json.loads(file.read())

for [url, title] in urls:
    title = title.split(' - ')[0].split('نموذج ')[1].strip()

    model_index = next((model[0] for model in list(enumerate(data)) if model[1]["name"] == title), -1)
    model = data[model_index]


    if model == None: continue

    # solution = acquire_solution(url)
    questions = list(filter(lambda e: e[1]["true"].strip() == "", enumerate(model["questions"])))

    if len(questions) == 0: continue

    solution = acquire_solution(url)
    print(f'Looking for {len(questions)}')
    for answer in solution:
        index = next((question[0] for question in questions if question[1]["question"] == answer["question"]), -1)

        if index != -1:
            model["questions"][index]["true"] = answer["true"]

    data[model_index] = model

with open('data.json', 'w', encoding='utf8') as file:
    file.write(json.dumps(data, ensure_ascii=False))
    # solution = acquire_solution(url)

    # for question in solution:


    

# import json, pyperclip
# with open('data.json', 'r', encoding='utf8') as file:
#     data = json.loads(file.read())

# models = []
# for model in data:
#     matched = next((question for question in model["questions"] if question["true"].strip() == ""), -1)
#     if matched != -1:
#         models.append(model["name"])
# pyperclip.copy(json.dumps(models, ensure_ascii=False))

# x = [9,12,13,14,16,17,18]
# result = []
# for i in x:
#     for j in range(0, 10):
#         url = f'https://qudratc.com/home/exams/{i}/{j}'
#         response = requests.get(url)
#         soup = BeautifulSoup(response.content, 'html.parser')

#         # pyperclip.copy(response.content.decode('utf8'))
#         exams = soup.select('.course-box-wrap a')

#         if len(exams) == 0:
#             print(f'Stopped at {j}')
#             break

#         for exam in exams:
#             url = exam['href']
#             title = exam.select_one('div div:last-child h5.title').get_text()

#             result.append([url, title])
