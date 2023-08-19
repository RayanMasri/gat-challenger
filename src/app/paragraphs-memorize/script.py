import json

def open_file(name):
    with open(name, 'r', encoding='utf8') as file:
        return json.loads(file.read())
    
def in_range(arr, index):
    try:
        arr[index]
        return True
    except:
        return False
data = open_file('./data.json')
status = open_file('./status.json')

assigned_ids = {}

for i in range(len(data)):
    status_cluster = status[i] if in_range(status, i) else []
    model = data[i]

    questions = list(filter(lambda e: e["status"] != 'normal', model["questions"]))

    for j in range(len(questions)):
        # print(questions[j])
        qid = str(questions[j]["id"])
        status_tuple = status_cluster[j] if in_range(status_cluster, j) else [0, 0]

        assigned_ids[qid] = status_tuple


all_questions = [subitem for item in list(map(lambda e: e["questions"], data)) for subitem in item]

for question in all_questions:
    qid = str(question["id"])
    if qid not in list(assigned_ids.keys()):
        assigned_ids[qid] = [0, 0]


assigned_ids = {k:v for k, v in list(sorted(assigned_ids.items(), key=lambda e: int(e[0])))}


with open('./paragraphs.json', 'w', encoding='utf8') as file:
    file.write(json.dumps(assigned_ids, ensure_ascii=False, sort_keys=False))





