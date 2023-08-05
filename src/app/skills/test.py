import json

def open_json(file):
    with open(file, 'r', encoding='utf8') as file:
        return json.loads(file.read())
    
status = open_json('./status.json')
data = open_json('./new-data.json')

output = {}

for model in range(len(data)):
    for cluster in range(len(status[model])):
        item = status[model][cluster]

        match = next((question["id"] for question in data[model]["questions"] if question["question"] == item["question"] and question["true"] == item["answer"]), -1)
        if match != -1:
            output[match] = [item["incorrect"], item["correct"]]

    # questions = list(map(lambda e: e["question"] + e["true"], data[model]["questions"]))

for model  in data:
    for question in model["questions"]:

        _id = question["id"]
        if _id not in list(output.keys()):
            output[_id] = [0, 0]

print(output)

