'use client';

import React, { FC, useContext, useState, useEffect, useRef } from 'react';
import data from './data.json';

import { ModelType, SkillQuestionType, StatusTupleVerbose } from '../types';
// import { useContext } from '../context';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { IoIosArrowForward } from 'react-icons/io';
import clsx from 'clsx';

const showIncorrect = false;

const setStatus = (newStatus: { [id: number]: [number, number] }) => {
	return new Promise((resolve, reject) => {
		fetch('/api/set', {
			method: 'POST',
			body: JSON.stringify({
				id: 'skills',
				headers: {
					'Accept': 'application/json, text/plain, */*',
					'Content-Type': 'application/json',
				},
				status: newStatus,
			}),
		})
			.then(async (result) => {
				let data = await result.json();
				resolve(data.success);
			})
			.catch(reject);
	});
};

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

interface StatusType {
	[id: number]: [number, number];
}

let statusObject: StatusType = {};

const StatusContext = React.createContext({
	context: statusObject,
	setContext: (e: StatusType) => {},
});
function StatusContextProvider(props: any) {
	const [context, setContext] = useState(statusObject);
	return <StatusContext.Provider value={{ context, setContext }}>{props.children}</StatusContext.Provider>;
}

// Context logic
interface ContextType {
	collapsed: number[];
	// status: StatusTupleVerbose[][];
	threshold: number;
	glass: boolean;
}
let object: ContextType = {
	collapsed: [],
	// status: getStatus(),
	threshold: -1,
	glass: true,
};
const Context = React.createContext({
	context: object,
	setContext: (e: ContextType) => {},
});
function ContextProvider(props: any) {
	const [context, setContext] = useState(object);
	return <Context.Provider value={{ context, setContext }}>{props.children}</Context.Provider>;
}

// SkillQuestionType
interface QuestionProps {
	info: SkillQuestionType;
	index: number;
	model: number;
	evaluate: boolean;
	onChange: (index: number) => void;
}
const Question: FC<QuestionProps> = ({ info, index, model, evaluate, onChange }) => {
	let { context, setContext } = useContext(Context);
	let { context: status } = useContext(StatusContext);

	const [state, setState] = useState<{
		selected: number;
		answers: [string, number][];
		tuple: [number, number];
		waiting: boolean; // Waits for status to be set when editing tuple
	}>({
		selected: -1,
		answers: shuffle(info.answers.map((answer, index) => [answer, index])),
		tuple: status[info.id],
		waiting: false,
	});
	// useEffect(() => {});

	const changeStatusTuple = (index: number, value: number) => {
		let edited = status[info.id];
		edited[index] += value;
		setState({
			...state,
			tuple: edited,
			waiting: true,
		});

		let _status = Object.assign({}, status);

		_status[info.id] = edited;

		setStatus(_status).then((result) => {
			if (result)
				setState({
					...state,
					waiting: false,
				});
		});

		// status[info.id] = edited

		// let status = getStatus();

		// // Change key to desired value
		// let correspondent = status[model][index];
		// status[model][index] = {
		// 	...correspondent,
		// 	[key]: correspondent[key] + value,
		// };

		// // Apply changes to local storage
		// localStorage.setItem('status-skills', JSON.stringify(status));

		// // Apply changes to context
		// setContext({
		// 	...context,
		// 	status: status,
		// });
	};

	// const getCorrespondent = () => {
	// 	// if (context.status[model][index] == null) {
	// 	// 	console.log(`Failed to get correspondent for status of model ${model}, question ${index}`);
	// 	// }
	// 	// return context.status[model][index] || { correct: 0, incorrect: 0 };
	// 	let result = state.tuple;

	// 	return {
	// 		correct: result[1],
	// 		incorrect: result[0],
	// 	};
	// 	// return { correct: 0, incorrect: 0 };
	// };

	const onTelegramCopy = () => {
		let formulated = `السؤال: ${info.question}

الخيارات:
${info.answers.filter((e) => e != '...').join('\n')}

الإجابة: ${info.true}
`;

		navigator.clipboard.writeText(formulated);
	};

	// useEffect(() => {
	// 	if (status[info.id] != state.tuple) {
	// 		console.log([status[info.id], state.tuple]);
	// 		setState({
	// 			...state,
	// 			tuple: status[info.id],
	// 		});
	// 	}
	// }, [status]);

	return (
		<div className={`w-full flex flex-col mb-2 ${context.glass && state.tuple[1] + state.tuple[0] <= context.threshold ? 'glass' : ''}`} style={{ direction: 'rtl' }}>
			<div className='w-full text-center text-cyan-100 text-2xl flex flex-row relative h-min'>
				<div className='h-full absolute top-0 left-0 w-full max-w-[200px] flex flex-row justify-end '>
					<div className='h-full flex flex-wrap justify-end content-start gap-1'>
						{info.status.split('&&').map((status) => {
							return <div className='text-[10px] h-[16px] p-2 flex justify-center items-center w-min text-black bg-cyan-100 rounded'>{status.trim()}</div>;
						})}
					</div>
					<div
						className='text-black text-[12px] h-full w-fit px-1 mr-1 rounded bg-cyan-100 transition-all hover:opacity-50 active:opacity-30'
						onClick={() => {
							onTelegramCopy();
						}}
					>
						Telegram
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
				<div className={`absolute top-0 right-0 flex flex-row gap-x-2 box-border ${state.waiting ? 'pointer-events-none opacity-20 bg-cyan-200' : 'pointer-events-all opacity-100'}`}>
					{state.tuple[0] > 0 ? (
						<div
							className='flex flex-row justify-center items-center text-red-100 hover:opacity-50 hover:bg-gray-900 p-[2px] rounded transition-all select-none'
							onMouseDown={(event) => {
								if (event.button == 0) {
									changeStatusTuple(0, 1);
								} else {
									changeStatusTuple(0, -1);
								}
							}}
							onContextMenu={(e) => e.preventDefault()}
						>
							<div>{state.tuple[0]}</div>
							<AiOutlineClose className='mt-1' />
						</div>
					) : (
						''
					)}
					{state.tuple[1] > 0 ? (
						<div
							className='flex flex-row justify-center items-center text-green-100 hover:opacity-50 hover:bg-gray-900 p-[2px] rounded transition-all select-none'
							onMouseDown={(event) => {
								event.preventDefault();
								if (event.button == 0) {
									changeStatusTuple(1, 1);
								} else {
									changeStatusTuple(1, -1);
								}
							}}
							onContextMenu={(e) => e.preventDefault()}
						>
							<div>{state.tuple[1]}</div>
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
	interface SelectedMap {
		[id: number]: number;
	}

	const [state, _setState] = useState<{
		error: string;
		evaluated: number[];
		selected: SelectedMap;
		waiting: number;
	}>({
		error: '',
		evaluated: [],
		selected: {},
		waiting: 0, // 0 - not waiting, 1 or 2 - server/context set
	});
	const _state = useRef(state);
	const setState = (data: any) => {
		_setState(data);
		_state.current = data;
	};

	let { context, setContext } = useContext(Context);
	let { context: status, setContext: setStatusContext } = useContext(StatusContext);

	const isCollapsed = () => context.collapsed.includes(index);

	const resetSolutions = () => {
		// Map through id's in model and change status accordingly
	};

	const evaluateQuestions = (target: number[], selected?: SelectedMap) => {
		let _selected: SelectedMap = selected || state.selected;
		let _status = Object.assign({}, status);

		let questions = data.map((model) => model.questions).flat();

		target.map((id) => {
			let question: SkillQuestionType | undefined = questions.find((question) => question.id == id);
			if (question == undefined) {
				console.log(`Failed to evaluate question with ID ${id}, not present in data.json`);
				return;
			}

			let index: number = _selected[id]; // Index of selected answer
			let correct = question.true == question.answers[index];

			let tuple = _status[id];

			tuple[0] += correct ? 0 : 1;
			tuple[1] += !correct ? 0 : 1;

			_status[id] = tuple;
		});

		// setState({
		// 	...state,
		// 	waiting: 2,
		// });
		setStatus(_status).then((success) => {
			if (success) {
				if (_state.current.waiting != 0) {
					console.log(`Set server: Decreasing waiting status from ${_state.current.waiting} to ${_state.current.waiting - 1}`);
					setState({
						..._state.current,
						waiting: _state.current.waiting - 1,
					});
				}
			}
		});

		setStatusContext(_status);
		// let status = getStatus();
		// status[index] = status[index].map((question: StatusTupleVerbose, _index: number) => {
		// 	let _question: SkillQuestionType = info.questions[_index];
		// 	if (_question.status == 'normal' || !target.includes(_index)) return question;

		// 	let correct = _question.answers[_selected[_index]] == _question.true;

		// 	return {
		// 		...question,
		// 		correct: correct ? question.correct + 1 : question.correct,
		// 		incorrect: !correct ? question.incorrect + 1 : question.incorrect,
		// 	};
		// });

		// // Apply changes to local storage
		// localStorage.setItem('status-skills', JSON.stringify(status));

		// // Apply changes to context
		// setContext({
		// 	...context,
		// 	status: status,
		// });
	};

	const onSubmit = () => {
		let difference = Math.abs(Object.keys(state.selected).length - info.questions.length);
		if (difference != 0 && state.error == '') {
			setState({
				...state,
				error: `${difference} answer(s) were left unanswered`,
			});
			return;
		}
		// if (
		// 	state.selected
		// 		.filter((_, _index) => info.questions[_index].status != 'normal' && (showIncorrect ? context.status[index][_index].incorrect > 0 : true))
		// 		.some((item: number) => item == -1) &&
		// 	state.error == ''
		// ) {

		// 	return;
		// }

		// let target = state.selected.map((selection, index) => (selection != -1 ? index : -1)).filter((e) => e != -1);
		// info.questions.map((_, index) => index + 1);

		let target = Object.keys(state.selected).map((e) => parseInt(e));

		setState({
			...state,
			evaluated: target,
			waiting: 2,
		});

		evaluateQuestions(target);
	};

	const changeAnswer = (id: number, answer: number) => {
		let selected = Object.assign({}, state.selected);
		selected[id] = answer;

		if (instant_evaluation) {
			setState({
				...state,
				selected: selected,
				evaluated: state.evaluated.concat([id]),
				waiting: 2,
			});

			evaluateQuestions([id], selected);
			return;
		}

		setState({
			...state,
			error: '',
			selected: selected,
		});
	};

	useEffect(() => {
		if (state.waiting != 0) {
			console.log(`Set context: Decreasing waiting status from ${state.waiting} to ${state.waiting - 1}`);
			setState({
				...state,
				waiting: state.waiting - 1,
			});
		}
	}, [status]);

	return (
		<div className={`w-full h-min bg-gray-800 p-2 transition-all ${state.waiting != 0 ? 'opacity-20 pointer-events-none bg-gray-200' : 'opacity-100 bg-gray-800 pointer-events-all'}`}>
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
						{info.questions.map((question: SkillQuestionType, _index: number) => {
							// Hide normal questions

							return <Question info={question} index={_index} model={index} evaluate={state.evaluated.includes(question.id)} onChange={(i) => changeAnswer(question.id, i)} />;
							// return (
							// 	<SkillQuestionType
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
	let { context: statusContext, setContext: setStatusContext } = useContext(StatusContext);

	const main = useRef(null);

	const onFilterMinimum = (threshold: number) => {
		// let status = getStatus();

		let collapsed: number[] = [];

		data.map((model, index) => {
			let questions = model.questions.filter((q) => q.status != 'normal');

			// let viable = data[index].questions.filter((question) => question.status != 'normal');
			// let questions = status[index].filter(
			// 	(question: StatusTupleVerbose) => viable.filter((_question: SkillQuestionType) => _question.question == question.question && _question.true == question.answer).length != 0
			// );
			// let collapse = questions.every((question: StatusTupleVerbose) => question.correct + question.incorrect > threshold);
			let collapse = questions.every((question: SkillQuestionType) => statusContext[question.id].reduce((a, b) => a + b, 0) > threshold);
			console.log(`Status of ${index} is ${collapse ? 'collapsed' : 'not collapsed'} with threshold ${threshold}`);
			if (collapse) collapsed.push(index);
		});

		setContext({
			...context,
			collapsed: collapsed,
			threshold: threshold,
		});
	};

	// let status = getStatus();

	useEffect(() => {
		fetch('/api/get', {
			method: 'POST',
			headers: {
				'Accept': 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ id: 'skills' }),
		}).then(async (response) => {
			let json = await response.json();
			setStatusContext(json.data);
		});
		// saveStatus(1);
	}, []);

	return (
		<div className='w-full h-screen top-0 left-0 fixed overflow-y-scroll gap-y-2 flex flex-col bg-blue-900' ref={main}>
			<div
				className={clsx(`w-full h-min py-5 px-2 bg-purple-900 z-10 sticky top-0 flex flex-row`)}
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
						className='mr-2 hover:opacity-50 active:opacity-30 transition-all bg-green-300'
						onClick={() => {
							setContext({
								...context,
								glass: !context.glass,
							});
						}}
					>
						{context.glass ? 'Disable ' : 'Enable '}&nbsp;glass
					</div>
				</div>
			</div>
			{/* <div className='w-full h-full flex flex-col gap-y-2 mt-20'> */}
			<div className='w-full h-full flex flex-col gap-y-2 '>
				{Object.keys(statusContext).length != 0
					? data.map((model, index) => {
							if (
								model.questions.filter((question: SkillQuestionType) => question.status != 'normal').length == 0 ||
								(showIncorrect && !model.questions.map((q) => statusContext[q.id]).some((e) => e[0] > 0))
							) {
								return;
							}

							model.questions = model.questions.filter((question) => {
								let tuple = statusContext[question.id];
								return question.status != 'normal' || (showIncorrect && tuple[0] > 0);
							});

							return <Model info={model} index={index} instant_evaluation={model.instant_evaluation} />;

							// let collapsed = context.collapsed.includes(index);
							// return paragraph.questions.some((question) => question.status != 'normal') ? <Paragraph paragraph={paragraph} paragraphIndex={index} collapsed={collapsed} /> : '';
					  })
					: ''}
			</div>
		</div>
	);
};

export default function Wrapper() {
	return (
		<StatusContextProvider>
			<ContextProvider>
				<Page />
			</ContextProvider>
		</StatusContextProvider>
	);
}
