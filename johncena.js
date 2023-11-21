let rows = Array.from(document.querySelectorAll('.GridClass > tbody > .StandardFontPlain')).slice(0, 7);
let maxes = [300, 500, 500, 500, 400, 300, 500];

let percent = 100.3;

let goal = Math.floor((percent / 100) * 3000);
let diff = 3000 - goal;
let range = Math.floor((diff / 7) * 2);
let name = 'حسن بن محمد بن عبدالله ابوشومي';
document.querySelector('#ctl00_PlaceHolderMain_lblStudentName').innerHTML = name;

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

let grades = {
	'ممتاز مرتفع': [105, 95],
	'ممتاز': [95, 90],
	'جيد جدًا مرتفع': [90, 85],
	'جيد جدًا': [85, 80],
	'جيد مرتفع': [80, 75],
	'جيد': [75, 70],
	'مقبول مرتفع': [70, 65],
	'مقبول': [65, 60],
	'راسب': [60, 1],
	'محروم': [1, 0],
};

function defineGrade(grade) {
	for (let [key, value] of Object.entries(grades)) {
		if (grade <= value[0] && grade >= value[1]) {
			return key;
		}
	}
}

let total = 0;
for (let i = 0; i < maxes.length; i++) {
	let max = maxes[i];
	let decrease = getRandomInt(1, range);
	if (total + decrease > diff) {
		decrease = diff - total;
	}

	if (decrease > max) decrease = max;

	let newMax = max - decrease;
	let newPercent = Math.floor((newMax / max) * 100);

	let td = Array.from(rows[i].children);
	td[1].innerHTML = newPercent.toString();
	td[3].innerHTML = newMax.toString();
	td[4].innerHTML = defineGrade(newPercent);
}

function generateRandomId() {
	let id = '11';
	for (let i = 0; i < 8; i++) {
		id += getRandomInt(0, 9).toString();
	}
	return id;
}
document.querySelector('#ctl00_PlaceHolderMain_lblIdentificationID').innerHTML = generateRandomId();

document.querySelector('#ctl00_PlaceHolderMain_lblAverageDescription').innerHTML = defineGrade((goal / 3000) * 100);
document.querySelector('#ctl00_PlaceHolderMain_lblPercentage').innerHTML = ((goal / 3000) * 100).toFixed(2);
document.querySelector('#ctl00_PlaceHolderMain_lblTotalMarks').innerHTML = goal;
