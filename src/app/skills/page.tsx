'use client';

import React, { FC, useContext, useState, useEffect, useRef } from 'react';
import data from './data.json';

import { ModelType, QuestionType, StatusTupleVerbose } from '../types';
// import { useContext } from '../context';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { IoIosArrowForward } from 'react-icons/io';
import clsx from 'clsx';
// import Image from 'next/image';
// import gpt from './chatgpt.svg';

// interface PProps {
// 	paragraph: ParagraphType;
// 	paragraphIndex: number;
// 	collapsed: boolean;
// }

// interface QProps {
// 	question: QuestionType;
// 	evaluate: boolean;
// 	status: number[];
// 	paragraphIndex: number;
// 	onChange: (index: number) => void;
// 	onAffect: (index: number, additive: number) => void;
// }

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

// const getRandomAnswer = (excluded: string[], paragraphIndex: number) => {
// 	// Get all answers
// 	let all = data[paragraphIndex].questions
// 		.map((question) => question.answers)
// 		.flat()
// 		.filter((answer) => answer.trim() != '-');

// 	// Remove excluded answer
// 	all = all.filter((item) => !excluded.includes(item));

// 	return all[Math.floor(Math.random() * all.length)];
// };

const getDefaultGlobalStatus = () => {
	return JSON.stringify(
		data.map((model) => {
			return model.questions.map((question) => {
				return {
					correct: 0,
					incorrect: 0,
					question: question.question,
					answer: question.true,
				};
			});
		})
	);
};

const getStatus = () => {
	let result: string | null = localStorage.getItem('status-skills');

	if (result == null || result == undefined || result.trim() == 'null' || result.trim() == '') {
		return JSON.parse(getDefaultGlobalStatus());
	}

	let parsed: StatusTupleVerbose[][] = JSON.parse(result);

	return parsed;
};

const refreshStatus = () => {
	let parsed: StatusTupleVerbose[][] = getStatus();

	let previous: StatusTupleVerbose[][] = [...parsed];

	parsed = parsed.map((model, index) => {
		// Removal
		let indices: number[] = [];
		for (let i = 0; i < model.length; i++) {
			let tuple = model[i];
			let exists = data[index].questions.some((question: QuestionType) => question.question == tuple.question && question.true == tuple.answer);

			// If tuple is present in status, but not present in data.json, remove from model
			if (!exists) indices.push(i);
		}
		model = model.filter((_, index) => !indices.includes(index));

		// Addition
		for (let i = 0; i < data[index].questions.length; i++) {
			let question: QuestionType = data[index].questions[i];

			let exists = model.some((tuple: StatusTupleVerbose) => question.question == tuple.question && question.true == tuple.answer);

			// If question is not present in status, but present in data.json, add to model
			if (!exists) {
				model.push({
					correct: 0,
					incorrect: 0,
					question: question.question,
					answer: question.true,
				});
			}
		}

		return model;
	});

	if (JSON.stringify(previous) != JSON.stringify(parsed)) {
		console.log(`Applied changes to status when fetching status`);
		localStorage.setItem('status-skills', JSON.stringify(parsed));
	}
};

// Context logic
interface ContextType {
	collapsed: number[];
	status: StatusTupleVerbose[][];
}
let object: ContextType = {
	collapsed: [],
	status: getStatus(),
};
const Context = React.createContext({
	context: object,
	setContext: (e: ContextType) => {},
});
function ContextProvider(props: any) {
	const [context, setContext] = useState(object);
	return <Context.Provider value={{ context, setContext }}>{props.children}</Context.Provider>;
}

// QuestionType
interface QuestionProps {
	info: QuestionType;
	index: number;
	model: number;
	evaluate: boolean;
	onChange: (index: number) => void;
}
const Question: FC<QuestionProps> = ({ info, index, model, evaluate, onChange }) => {
	let { context, setContext } = useContext(Context);

	const [state, setState] = useState<{
		selected: number;
		answers: [string, number][];
	}>({
		selected: -1,
		answers: shuffle(info.answers.map((answer, index) => [answer, index])),
	});
	// useEffect(() => {});

	const changeStatusTuple = (key: string, value: number) => {
		let status = getStatus();

		// Change key to desired value
		let correspondent = status[model][index];
		status[model][index] = {
			...correspondent,
			[key]: correspondent[key] + value,
		};

		// Apply changes to local storage
		localStorage.setItem('status-skills', JSON.stringify(status));

		// Apply changes to context
		setContext({
			...context,
			status: status,
		});
	};

	const getCorrespondent = () => {
		if (context.status[model][index] == null) {
			console.log(`Failed to get correspondent for status of model ${model}, question ${index}`);
		}
		return context.status[model][index] || { correct: 0, incorrect: 0 };
	};
	return (
		<div className='w-full flex flex-col mb-2' style={{ direction: 'rtl' }}>
			<div className='w-full text-center text-cyan-100 text-2xl flex flex-row relative h-min'>
				<div className='h-full absolute top-0 left-0 w-full max-w-[200px] flex flex-row justify-end '>
					<div className='h-full flex flex-wrap justify-end content-start gap-1'>
						{info.status.split('&&').map((status) => {
							return <div className='text-[10px] h-[16px] p-2 flex justify-center items-center w-min text-black bg-cyan-100 rounded'>{status.trim()}</div>;
						})}
					</div>
					{/* <div className='bg-gpt rounded flex items-center justify-center p-[2px] mr-2 h-full w-[24px] transition-all hover:opacity-50 active:opacity-20' onClick={onFormulateGPT}>
						<Image priority src={gpt} alt='Follow us on Twitter' />
					</div> */}
				</div>

				{/* <div className='w-full bg-red-900'>{question.question}</div> */}
				{/* <div className='w-full break-words px-20'>{question.question}</div> */}
				{/* <div className='w-full break-words px-36'>{question.question}</div> */}
				<div className='w-full break-words px-36'>
					{/* نشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسشنشسيتمنشسينمتشسينمتسش */}
					{info.question}
				</div>
				{/* <div className='absolute top-2/4 right-0 mt-[-16px] flex flex-row gap-x-2'> */}
				<div className='absolute top-0 right-0 flex flex-row gap-x-2 box-border'>
					{getCorrespondent().incorrect > 0 ? (
						<div
							className='flex flex-row justify-center items-center text-red-100 hover:opacity-50 hover:bg-gray-900 p-[2px] rounded transition-all select-none'
							onMouseDown={(event) => {
								if (event.button == 0) {
									changeStatusTuple('incorrect', 1);
								} else {
									changeStatusTuple('incorrect', -1);
								}
							}}
						>
							<div>{getCorrespondent().incorrect}</div>
							<AiOutlineClose className='mt-1' />
						</div>
					) : (
						''
					)}
					{getCorrespondent().correct > 0 ? (
						<div
							className='flex flex-row justify-center items-center text-green-100 hover:opacity-50 hover:bg-gray-900 p-[2px] rounded transition-all select-none'
							onMouseDown={(event) => {
								event.preventDefault();
								if (event.button == 0) {
									changeStatusTuple('correct', 1);
								} else {
									changeStatusTuple('correct', -1);
								}
							}}
						>
							<div>{getCorrespondent().correct}</div>
							<AiOutlineCheck className='mt-1' />
						</div>
					) : (
						''
					)}
				</div>
			</div>
			<div className='w-full grid grid-cols-2 gap-3 pt-2'>
				{state.answers.map(([answer, _index]) => {
					return (
						<div className='w-full bg-green-800 rounded-lg py-2 text-right flex flex-row text-2xl justify-between items-center'>
							{/* <div className='ml-3'>{evaluate ? answer == question.true ? <AiOutlineCheck /> : index == state.selected ? <AiOutlineClose /> : '' : ''}</div> */}
							<div className='flex flex-row items-center w-full'>
								{/* <div>{answer}</div> */}
								<input
									type='radio'
									className='w-[18px] h-[18px] mx-2'
									checked={state.selected == _index}
									onChange={() => {}}
									onClick={() => {
										onChange(_index);
										setState({ ...state, selected: _index });
									}}
								/>
								<div className='w-full break-words max-w-[850px] flex flex-row'>
									{answer}
									{evaluate && answer == info.true ? <div className='mr-3 text-gray-400 text-[16px]'>{info.notes}</div> : ''}
								</div>
							</div>
							<div className='ml-3'>
								{evaluate ? answer == info.true ? <AiOutlineCheck className='text-green-300' /> : _index == state.selected ? <AiOutlineClose className='text-red-500' /> : '' : ''}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

// Model
interface ModelProps {
	info: ModelType;
	index: number;
	instant_evaluation: boolean | undefined;
}
const Model: FC<ModelProps> = ({ info, index, instant_evaluation }) => {
	const [state, setState] = useState<{
		error: string;
		evaluated: number[];
		selected: number[];
	}>({
		error: '',
		evaluated: [],
		selected: new Array(info.questions.length).fill(-1),
	});

	let { context, setContext } = useContext(Context);

	const isCollapsed = () => context.collapsed.includes(index);

	const resetSolutions = () => {
		let status = getStatus();

		status[index] = data[index].questions.map((question) => {
			return {
				correct: 0,
				incorrect: 0,
				question: question.question,
				answer: question.true,
			};
		});

		setContext({
			...context,
			status: status,
		});
		localStorage.setItem('status-skills', JSON.stringify(status));
	};

	const evaluateQuestions = (target: number[], selected?: number[]) => {
		let _selected: number[] = selected || state.selected;

		let status = getStatus();
		status[index] = status[index].map((question: StatusTupleVerbose, _index: number) => {
			let _question: QuestionType = info.questions[_index];
			if (_question.status == 'normal' || !target.includes(_index)) return question;

			let correct = _question.answers[_selected[_index]] == _question.true;

			return {
				...question,
				correct: correct ? question.correct + 1 : question.correct,
				incorrect: !correct ? question.incorrect + 1 : question.incorrect,
			};
		});

		// Apply changes to local storage
		localStorage.setItem('status-skills', JSON.stringify(status));

		// Apply changes to context
		setContext({
			...context,
			status: status,
		});
	};

	const onSubmit = () => {
		if (state.selected.filter((_, _index) => info.questions[_index].status != 'normal').some((item: number) => item == -1)) {
			setState({
				...state,
				error: `${state.selected.filter((item, _index) => item == -1 && info.questions[_index].status != 'normal')} answer(s) were left unanswered`,
			});
			return;
		}

		let target = info.questions.map((_, index) => index + 1);

		setState({
			...state,
			evaluated: target,
		});

		evaluateQuestions(target);
	};

	const changeAnswer = (question: number, answer: number) => {
		let selected = [...state.selected];
		selected[question] = answer;

		if (instant_evaluation) {
			setState({
				...state,
				selected: selected,
				evaluated: state.evaluated.concat([question]),
			});

			evaluateQuestions([question], selected);
			return;
		}

		setState({
			...state,
			selected: selected,
		});
	};

	return (
		<div className='w-full h-min bg-gray-800 p-2'>
			<div className='text-5xl w-full flex justify-center items-center text-center mb-5 flex-row relative pt-2'>
				<div className='absolute h-full top-0 left-0 flex justify-center items-center text-[14px] text-black'>
					<div className='bg-cyan-300 rounded p-2 hover:opacity-50 transition-all' onClick={resetSolutions}>
						Reset solutions
					</div>
				</div>
				<div
					className={`mt-2 mr-2 ${!isCollapsed() ? 'rotate-90' : ''} hover:opacity-50 transition-all`}
					onClick={() => {
						let collapsed: number[] = [...context.collapsed];

						if (collapsed.includes(index)) {
							let _index = collapsed.findIndex((item) => item == index);
							collapsed.splice(_index, 1);
						} else {
							collapsed.push(index);
						}

						setContext({
							...context,
							collapsed: collapsed,
						});
					}}
				>
					<IoIosArrowForward />
				</div>
				<div>{info.name}</div>
				&nbsp;
				<div> - {index}</div>
			</div>
			{!isCollapsed() ? (
				<div className='flex flex-col w-full pb-5'>
					<div className='flex flex-col'>
						{info.questions.map((question: QuestionType, _index: number) => {
							// Hide normal questions
							if (question.status == 'normal') return;

							return <Question info={question} index={_index} model={index} evaluate={state.evaluated.includes(_index)} onChange={(i) => changeAnswer(_index, i)} />;
							// return (
							// 	<QuestionType
							// 		paragraphIndex={paragraphIndex}
							// 		question={question}
							// 		evaluate={state.evaluation}
							// 		status={state.status[questionIndex]}
							// 		onChange={(answerIndex) => onChange(questionIndex, answerIndex)}
							// 		onAffect={(choiceIndex, additive) => onAffect(questionIndex, choiceIndex, additive)}
							// 	/>
							// );
						})}
					</div>
					<div className='w-full flex justify-center items-center'>
						<div className='w-fit text-2xl p-2 rounded bg-cyan-600 text-white mt-3 px-44 transition-all select-none hover:opacity-50 active:opacity-30' onClick={onSubmit}>
							Submit
						</div>
					</div>
					<div className='w-full text-red-800 flex justify-center items-center mt-1'>{state.error}</div>
				</div>
			) : (
				''
			)}
		</div>
	);
};

const Page = () => {
	const [state, setState] = useState({
		headerFixed: false,
		headerOffset: 0,
	});
	let { context, setContext } = useContext(Context);

	const main = useRef(null);

	const onFilterMinimum = (threshold: number) => {
		let status = getStatus();

		let collapsed: number[] = [];

		data.map((_, index) => {
			let matched = status[index].every((question: StatusTupleVerbose) => question.correct + question.incorrect <= threshold);
			if (!matched) collapsed.push(index);
		});

		setContext({
			...context,
			collapsed: collapsed,
		});
	};

	return (
		<div className='w-full h-screen top-0 left-0 fixed overflow-y-scroll gap-y-2 flex flex-col bg-blue-900' ref={main}>
			<div
				className={clsx(`w-full h-min py-5 px-2 bg-purple-900 z-10 sticky top-0`)}
				// style={{
				// 	top: state.headerFixed ? 0 : -state.headerOffset,
				// 	transition: '0.05s',
				// }}
			>
				<div className='flex flex-row w-fit'>
					<div className='mr-2'>Filter paragraph by minimum:</div>
					<input type='number' min='0' className='text-black' onChange={(event) => onFilterMinimum(parseInt(event.target.value))} />
				</div>
				<div className='flex flex-row w-fit'>
					<div
						className='mr-2 hover:opacity-50 active:opacity-30 transition-all'
						onClick={() => {
							refreshStatus();
						}}
					>
						Refresh Status
					</div>
				</div>
			</div>
			{/* <div className='w-full h-full flex flex-col gap-y-2 mt-20'> */}
			<div className='w-full h-full flex flex-col gap-y-2 '>
				{data.map((model, index) => {
					if (model.questions.filter((question: QuestionType) => question.status != 'normal').length == 0) return;
					return <Model info={model} index={index} instant_evaluation={model.instant_evaluation} />;

					// let collapsed = context.collapsed.includes(index);
					// return paragraph.questions.some((question) => question.status != 'normal') ? <Paragraph paragraph={paragraph} paragraphIndex={index} collapsed={collapsed} /> : '';
				})}
			</div>
		</div>
	);
};

export default function Wrapper() {
	return (
		<ContextProvider>
			<Page />
		</ContextProvider>
	);
}
