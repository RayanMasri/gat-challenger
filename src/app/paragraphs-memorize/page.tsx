'use client';

import React, { FC, useRef, useState, useEffect } from 'react';
import data from '../paragraphs/data.json';
import { BsAsterisk } from 'react-icons/bs';
import { ParagraphType, QuestionType, StatusTuple } from '../types';

interface PProps {
	paragraph: ParagraphType;
	questions: QuestionType[];
}

interface QProps {
	question: QuestionType;
}

function shuffle(array: any[]) {
	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}

// const localId = 'p-memorize-marks';
const localId = 'p-memorize-marks-elaqa';

const getMarks = () => {
	return JSON.parse(localStorage.getItem(localId) || '{}');
};

const setMarks = (data: object) => {
	localStorage.setItem(localId, JSON.stringify(data));
};

const getMarksById = (id: number) => {
	if (id == -1) return 0;
	return parseInt(getMarks()[id]) || 0;
};

const Question: FC<QProps> = ({ question }) => {
	const getId = () => {
		return question.id == undefined ? -1 : question.id;
	};

	const [state, _setState] = useState({
		shown: false,
		marks: getMarksById(getId()),
		timeout: null,
	});

	const _state = useRef(state);
	const setState = (data: any) => {
		_setState(data);
		_state.current = data;
	};

	const mark = (addition: number) => {
		setState({
			...state,
			marks: state.marks + addition,
		});

		let id = getId();
		let marks = getMarks();
		marks[id] = state.marks + addition;

		setMarks(marks);
	};

	const toggle = () => {
		let changed = !state.shown;

		if (state.timeout != null) clearTimeout(state.timeout);

		if (changed) {
			setState({
				...state,
				shown: changed,
				timeout: setTimeout(() => {
					setState({
						..._state.current,
						shown: false,
					});
				}, 3000),
			});
			return;
		}
		setState({ ...state, shown: changed });
	};
	return (
		<div className='w-full flex flex-col mb-2' style={{ direction: 'rtl' }}>
			<div className='w-full text-center text-cyan-100 text-2xl flex flex-col justify-center items-center relative h-min'>
				<div className='h-full absolute top-0 left-0 w-full max-w-[200px] flex flex-row justify-end '>
					<div className='h-full flex flex-wrap justify-end content-start gap-1'>
						{question.status.split('&&').map((status) => {
							return <div className='text-[10px] h-[16px] p-2 flex justify-center items-center w-min text-black bg-cyan-100 rounded'>{status.trim()}</div>;
						})}
					</div>
				</div>
				<div
					className={`${state.marks == 0 ? 'hidden' : 'flex'} h-full absolute top-0 right-0 w-full max-w-[200px] flex-row justify-start items-start ${
						localId.includes('elaqa') ? 'text-[#fbbf24]' : 'text-purple-600'
					}`}
				>
					<div>{state.marks}</div>
					<BsAsterisk className='mt-[5px] mr-1 hover:opacity-50 transition-all' onClick={() => mark(-1)} />
				</div>

				<div className='w-full break-words px-36 hover:opacity-50 transition-all' onClick={toggle}>
					{question.question}
				</div>

				<div
					className={`${state.shown ? 'flex' : 'hidden'} hover:opacity-50 transition-all text-[16px] text-cyan-600 flex flex-col justify-center items-center w-full`}
					onClick={() => mark(1)}
				>
					<div>{question.true}</div>
					<div className='text-red-800'>{question.notes}</div>
				</div>
			</div>
		</div>
	);
};

const Paragraph: FC<PProps> = ({ paragraph, questions }) => {
	// const getClusteredParagraph = () => {
	// 	let content: string = paragraph.paragraph;
	// 	let matches: string[] = [...content.matchAll(/\d-\s/g)].map((e) => e[0]);
	// 	let indices: number[] = matches.map((e: string) => content.indexOf(e));

	// 	let slices: string[] = [];
	// 	indices.reduce((a, b) => {
	// 		if (a == 0) return b;
	// 		slices.push(content.slice(a, b));
	// 		return b;
	// 	}, 0);

	// 	return slices.map((slice) => {
	// 		let number = slice.slice(0, 3);
	// 		let rest = slice.slice(3);

	// 		return (
	// 			<div>
	// 				<div className='text-red-900'>{number}</div>
	// 				<div>{rest}</div>
	// 			</div>
	// 		);
	// 	});
	// };

	return (
		<div className='w-full h-min bg-gray-800 p-2'>
			<div className='text-5xl w-full flex justify-center items-center text-center mb-5 flex-row relative pt-2'>
				<div>{paragraph.title}</div>
				&nbsp;
				<div> - {paragraph.index}</div>
			</div>
			<div className='flex flex-col w-full pb-5'>
				<div className='text-2xl text-center p-3 text-gray-300 border border-white rounded-lg my-3'>{paragraph.paragraph}</div>
				{/* <div className='text-2xl text-center p-3 text-gray-300 border border-white rounded-lg my-3'>{getClusteredParagraph()}</div> */}
				<div className='flex flex-col'>
					{questions.map((question) => {
						return <Question question={question} />;
					})}
				</div>
			</div>
		</div>
	);
};

export default function Page() {
	const onFilterMinimum = (threshold: number) => {
		// let status = getStatus();
		// let collapsed: number[] = [];
		// data.map((paragraph, index) => {
		// 	let matched = status[index].every((question: number[]) => question.reduce((a, b) => a + b, 0) <= threshold);
		// 	if (!matched) collapsed.push(index);
		// });
		// console.log(collapsed);
		// setContext({
		// 	...context,
		// 	collapsed: collapsed,
		// });
	};

	return (
		<div className='w-full h-screen top-0 left-0 fixed overflow-y-scroll gap-y-2 flex flex-col bg-blue-900'>
			<div className='w-full bg-purple-900 h-min py-5 px-2'>
				<div className='flex flex-row w-fit'>
					<div className='mr-2'>Filter paragraph by minimum:</div>
					<input type='number' className='text-black' onChange={(event) => onFilterMinimum(parseInt(event.target.value))} />
				</div>
			</div>
			<div className='w-full h-full flex flex-col gap-y-2'>
				{shuffle(data).map((paragraph, index) => {
					if (paragraph.index >= 232 && paragraph.index <= 299) return '';
					// let questions = paragraph.questions.filter((question) => question.status != 'normal');
					// if (questions.length == 0) return '';
					let questions = shuffle(paragraph.questions);

					questions = questions.filter((question) => {
						return question.status.includes('elaqa') || question.question.includes('علاقة') || question.question.includes('علاقه');
					});

					questions = questions.filter((question) => {
						let marks = getMarksById(question.id);
						return marks > 0;
					});

					return questions.length > 0 ? <Paragraph paragraph={paragraph} questions={questions} /> : '';
				})}
			</div>
		</div>
	);
}
