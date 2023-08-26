let questions = Array.from(document.querySelectorAll('div[role="list"] > div[role="listitem"]:not(:first-child)'));

questions = questions.filter((question) => {
	return Array.from(question.firstChild.children).some((child) => {
		return child.getAttribute('jscontroller') != null;
	});
});

questions = questions.map((question) => {
	return question.querySelector('div[role="heading"] > span').textContent.trim();
});

setTimeout(function () {
	navigator.clipboard.writeText(JSON.stringify(questions));
}, 1000);
