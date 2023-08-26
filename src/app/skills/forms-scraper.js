let element = document.querySelector('body > div > div:nth-child(2) > div:nth-child(4) > div > div > div:nth-child(8) > div');
let labels = Array.from(element.querySelectorAll('label'));

let correctAnswer = '';
let answers = labels.slice(0, 4).map((e) => e.textContent.trim().replace(/\n/g, ''));
if (labels.length == 5) {
	correctAnswer = labels[4].textContent.trim();
} else {
	for (let answer of answers) {
		if (answer.includes('Correct')) {
			correctAnswer = answer.replace('Correct', '');
		}
	}
}

answers = answers.map((e) => {
	e = e.replace('Incorrect', '');
	e = e.replace('Correct', '');
	return e;
});

let question = element.querySelector('div[role="heading"] > span').textContent.trim().replace(/\n/g, '');

let object = {
	'question': question,
	'answers': answers,
	'true': correctAnswer,
	'status': 'missing',
	'skill': 'arbitrary',
	'id': 1111,
};

console.log(JSON.stringify(object));
