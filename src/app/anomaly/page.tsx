'use client';

import React, { FC, useContext, useState, useEffect, useRef } from 'react';
import data from './data.json';

import { AnomalyAnswerType, AnomalyQuestionType, AnomalyStatusTuple } from '../types';
import { AiOutlineCheck, AiOutlineClose, AiOutlineLink } from 'react-icons/ai';
import { IoIosArrowForward } from 'react-icons/io';
import { BiSolidBrain } from 'react-icons/bi';

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

const getDefaultGlobalStatus = () => {
	return JSON.stringify(
		data.map((question) => {
			return {
				correct: 0,
				incorrect: 0,
				answers: question.answers.map((answer) => answer.content).sort(),
				solution: question.solution,
			};
		})
	);
};

const compareArrays = (array1: any[], array2: any[]) => array1.toString() == array2.toString();

const getStatus = () => {
	let result: string | null = localStorage.getItem('status-anomaly');
	if (result == null || result == undefined || result.trim() == 'null' || result.trim() == '') {
		return JSON.parse(getDefaultGlobalStatus());
	}

	return JSON.parse(result);
};

const refreshStatus = () => {
	let parsed: AnomalyStatusTuple[] = getStatus();
	let previous: AnomalyStatusTuple[] = [...parsed];

	// Removal
	let indices: number[] = [];
	parsed.map((tuple, index) => {
		let exists = data.some((question: AnomalyQuestionType) => compareArrays(question.answers.map((e) => e.content).sort(), tuple.answers.sort()) && question.solution == tuple.solution);
		// If tuple is present in status, but not present in data.json, remove from model
		if (!exists) indices.push(index);
	});
	parsed = parsed.filter((_, index) => !indices.includes(index));

	// Addition
	for (let i = 0; i < data.length; i++) {
		let question = data[i];
		let exists = parsed.some((tuple: AnomalyStatusTuple) => compareArrays(question.answers.map((e) => e.content).sort(), tuple.answers.sort()) && question.solution == tuple.solution);

		// If question is not present in status, but present in data.json, add to model
		if (!exists) {
			parsed.splice(i, 0, {
				correct: 0,
				incorrect: 0,
				answers: question.answers.map((e) => e.content).sort(),
				solution: question.solution,
			});
		}
	}

	if (JSON.stringify(previous) != JSON.stringify(parsed)) {
		console.log(`Applied changes to status when fetching status`);
		localStorage.setItem('status-anomaly', JSON.stringify(parsed));
	}
};

// Context logic
interface ContextType {
	collapsed: number[];
}
let object: ContextType = {
	collapsed: [],
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
	info: AnomalyQuestionType;
	index: number;
	status: AnomalyStatusTuple;
	onSubmit: (correct: number, incorrect: number) => void;
}
const Question: FC<QuestionProps> = ({ info, index, status, onSubmit }) => {
	const getAnswers = () => {
		let answers = info.answers.map((answer, index) => [answer, index]);
		return shuffle(answers);
	};

	const getMarked = () => JSON.parse(localStorage.getItem('anomaly-marked') || '[]');

	const isDifficult = () => getMarked().includes(index);

	const [state, setState] = useState<{
		evaluate: boolean;
		fade: boolean;
		answers: [AnomalyAnswerType, number][];
		selected: number;
		status: AnomalyStatusTuple;
		difficult: boolean;
	}>({
		evaluate: false,
		fade: false,
		answers: getAnswers(),
		selected: -1,
		status: status || { correct: 0, incorrect: 0, answers: [], solution: '' },
		difficult: isDifficult(),
	});

	let { context, setContext } = useContext(Context);

	// useEffect(() => {
	// 	setState({
	// 		...state,
	// 		answers: shuffle(info.answers.map((answer, index) => [answer, index])),
	// 	});
	// }, []);

	useEffect(() => {
		if (!state.evaluate) return;

		setState({ ...state, fade: true });
	}, [state.evaluate]);

	const isCollapsed = () => context.collapsed.includes(index);

	const markDifficult = () => {
		let marked = getMarked();

		if (marked.includes(index)) {
			let _index = marked.findIndex((item: number) => item == index);
			marked.splice(_index, 1);
		} else {
			marked.push(index);
		}

		setState({
			...state,
			difficult: !state.difficult,
		});

		localStorage.setItem('anomaly-marked', JSON.stringify(marked));
	};

	const showMeaning = (word: string) => {
		let url = `https://www.almaany.com/ar/dict/ar-ar/${word}/`;

		window.open(url, '_blank');
	};

	return (
		<div className='w-full flex flex-row mb-2 px-2 items-center' style={{ direction: 'rtl' }}>
			<div className='h-full bg-[#25253E] py-[2px] w-[128px] text-2xl rounded flex items-center justify-center flex-col'>
				<div className='w-full flex flex-row justify-center items-center'>
					<div
						onClick={() => {
							markDifficult();
						}}
						className='mt-[2px] hover:opacity-50 transition-all ml-[4px] h-full flex justify-center items-center'
					>
						<BiSolidBrain size={18} className={`${state.difficult ? 'text-red-900' : 'text-white'} transition-all`} />
					</div>
					<div>Q{index + 1}</div>
					<div
						onClick={() => {
							let collapsed = [...context.collapsed];

							if (collapsed.includes(index)) {
								collapsed.splice(collapsed.indexOf(index), 1);
							} else {
								collapsed.push(index);
							}

							setContext({
								...context,
								collapsed: collapsed,
							});
						}}
						className={`mt-1 ${!isCollapsed() ? 'rotate-90' : ''} hover:opacity-50 transition-all`}
					>
						<IoIosArrowForward />
					</div>
				</div>
				{!isCollapsed() ? (
					<div className='w-full'>
						<div className='w-full h-[2px] bg-gray-100 my-1'>&nbsp;</div>
						<div className='w-full flex justify-between flex-row items-center px-2 text-red-300'>
							<div>{state.status.incorrect}</div>
							<AiOutlineClose />
						</div>
						<div className='w-full flex justify-between flex-row items-center px-2 text-green-300 mt-1'>
							<div>{state.status.correct}</div>
							<AiOutlineCheck />
						</div>
					</div>
				) : (
					''
				)}
			</div>

			{!isCollapsed() ? (
				<div className='w-full grid grid-cols-2 gap-3 mr-3 '>
					{state.answers.map(([answer, _index]) => {
						return (
							<div
								className={`w-full box-border ${
									state.evaluate ? (answer.content == info.solution ? 'bg-[#759584]' : state.selected == _index ? 'bg-[#A96072]' : 'bg-[#293241]') : 'bg-[#293241]'
								} rounded-lg py-2 text-right flex flex-row text-2xl justify-between items-center transition-all`}
							>
								<div className='flex flex-row items-center w-full'>
									<input
										type='radio'
										className='w-[18px] h-[18px] mx-2'
										checked={state.selected == _index}
										onChange={() => {}}
										onClick={() => {
											if (state.evaluate) return;

											let correct: boolean = answer.content == info.solution;

											setState({
												...state,
												selected: _index,
												evaluate: true,
												status: {
													...state.status,
													correct: state.status.correct + (correct ? 1 : 0),
													incorrect: state.status.incorrect + (!correct ? 1 : 0),
												},
											});

											onSubmit(correct ? 1 : 0, !correct ? 1 : 0);
										}}
									/>
									<div
										className={`w-full break-words max-w-[850px] flex flex-row ${
											state.evaluate && (answer.content == info.solution || state.selected == _index) ? 'text-[#21355c]' : 'text-[#C59F96]'
										}`}
									>
										{answer.content}
										{state.evaluate && answer.meaning != '' ? <div className='mr-3 text-[#FFD3BA] text-[16px]'>{answer.meaning}</div> : ''}
									</div>
								</div>
								<AiOutlineLink
									className='ml-1 hover:opacity-50 transition-all'
									onClick={() => {
										showMeaning(answer.content);
									}}
								/>

								<div className='ml-3'>
									{state.evaluate ? (
										answer.content == info.solution ? (
											<AiOutlineCheck className={`text-green-900 ${state.fade ? 'opacity-100' : 'opacity-0'} transition-all`} />
										) : _index == state.selected ? (
											<AiOutlineClose className={`text-red-900 ${state.fade ? 'opacity-100' : 'opacity-0'} transition-all`} />
										) : (
											''
										)
									) : (
										''
									)}
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className='w-full bg-[#5a5a8c] rounded h-[2px] mx-2'>&nbsp;</div>
			)}
		</div>
	);
};

const Page = () => {
	let { context, setContext } = useContext(Context);

	const [state, _setState] = useState<{
		filterMinimumValue: number;
		pace: [number | null, number | null];
		paces: number[];
		timestamp: number | null;
		blur: number | null;
		initial: number;
		elapsed: number;
		trueInitial: number;
		trueElapsed: number;
	}>({
		filterMinimumValue: 0,
		pace: [null, null],
		paces: [],
		timestamp: null,
		blur: null,
		initial: Date.now(),
		elapsed: 0,
		trueInitial: Date.now(),
		trueElapsed: 0,
	});

	const _state = useRef(state);
	const setState = (data: any) => {
		_setState(data);
		_state.current = data;
	};

	const questions: React.RefObject<HTMLInputElement> = useRef(null);
	const main: React.RefObject<HTMLInputElement> = useRef(null);
	let status = getStatus();

	const getFilteredIndices = (threshold: number = 0) => {
		let status = getStatus();

		let indices: number[] = [];
		data.map((_, index) => {
			let tuple: AnomalyStatusTuple = status[index];
			if (tuple == undefined) {
				return;
			}

			let matched = tuple.correct + tuple.incorrect >= (threshold || state.filterMinimumValue);
			if (matched) indices.push(index);
		});
		console.log(indices);

		return indices;
	};

	const onFilterMinimum = (threshold: number) => {
		let collapsed: number[] = getFilteredIndices(threshold);
		setContext({
			...context,
			collapsed: collapsed,
		});
	};

	const onSubmit = (correct: number, incorrect: number, index: number) => {
		let timestamp = Date.now();

		parsePace(state.timestamp, timestamp);

		let status = getStatus();
		status[index].correct += correct;
		status[index].incorrect += incorrect;
		localStorage.setItem('status-anomaly', JSON.stringify(status));
	};

	const parsePace = (previous: number | null, current: number) => {
		if (previous == null) return setState({ ...state, timestamp: current });

		let pace = (current - previous) / 1000;

		let [minimum, maximum] = state.pace;

		if (minimum == null || maximum == null) {
			return setState({
				...state,
				pace: [pace, pace],
				paces: state.paces.concat([pace]),
				timestamp: current,
			});
		} else {
			if (pace < minimum) minimum = pace;
			if (pace > maximum) maximum = pace;

			setState({
				...state,
				pace: [minimum, maximum],
				paces: state.paces.concat([pace]),
				timestamp: current,
			});
		}
	};

	const getRemaining = () => data.length - getFilteredIndices().length;

	const formatSeconds = (seconds: number) => {
		let minutes = Math.floor(seconds / 60);
		let hours = minutes / 60;

		if (hours >= 1) return `${hours.toFixed(2)}h`;
		if (minutes > 0) return `${minutes}m`;
		return `${Math.floor(seconds)}s`;
	};

	const onFocus = () => {
		if (_state.current.blur == null) return;
		let inactive = Date.now() - _state.current.blur;

		console.log(`Been inactive for ${inactive}ms`);
		if (_state.current.timestamp == null) {
			return setState({
				..._state.current,

				initial: _state.current.initial + inactive,
			});
		}

		setState({
			..._state.current,

			timestamp: _state.current.timestamp + inactive,
			initial: _state.current.initial + inactive,
		});
	};

	const onBlur = () => {
		setState({
			..._state.current,

			blur: Date.now(),
		});
	};

	const onTimer = () => {
		setState({
			..._state.current,
			elapsed: Math.floor((Date.now() - _state.current.initial) / 1000),
			trueElapsed: Math.floor((Date.now() - _state.current.trueInitial) / 1000),
		});
	};

	useEffect(() => {
		let value = parseInt(localStorage.getItem('filter-minimum') || '0');

		window.addEventListener('focus', onFocus);
		window.addEventListener('blur', onBlur);

		onFilterMinimum(value);

		setState({
			...state,
			filterMinimumValue: value,
		});

		setTimeout(function () {
			if (questions.current == null) return console.log('Failed to scroll, question div is null');
			if (main.current == null) return console.log('Failed to scroll, main div is null');

			let indices = getFilteredIndices(value).sort((a, b) => a - b);
			for (let i = 1; i < indices.length; i++) {
				let difference = indices[i] - indices[i - 1];
				if (difference == 1) continue;

				let latest = Array.from(questions.current.children)[indices[i] + 1];
				if (latest) {
					latest.scrollTo();
					return;
				}
			}

			let index = indices[indices.length - 1] + 1;
			let latest = Array.from(questions.current.children)[index];
			if (latest) {
				let rect: DOMRect = latest.getBoundingClientRect();
				let scrollValue = rect.y - rect.height - 20;

				main.current.scrollTo(0, scrollValue);
				return;
			}
		}, 10);

		let interval = setInterval(onTimer, 1000);

		return () => {
			clearInterval(interval);
			window.removeEventListener('focus', onFocus);
			window.removeEventListener('blur', onBlur);
		};
	}, []);

	return (
		<div className='w-full h-screen top-0 left-0 fixed overflow-y-scroll gap-y-2 flex flex-col bg-[#171819]' ref={main}>
			<div className='w-full py-2 px-2 bg-[#5EA4D7] z-10 sticky top-0 flex flex-row justify-between items-center gap-x-2'>
				<div className='flex flex-row justify-center items-center w-min gap-x-2 h-full'>
					<div className='flex flex-col w-fit h-full bg-[#25253E] justify-center items-center rounded py-2'>
						<div className='mr-2 text-1xl'>Minimum sum filter</div>
						<input
							type='text'
							className='text-white text-center text-2xl outline-none border-none bg-transparent w-[250px] border-b-2 border-gray-300'
							value={state.filterMinimumValue.toString()}
							onChange={(event) => {
								let value: string | number = event.target.value;

								try {
									value = parseInt(value);
									if (isNaN(value)) return;

									localStorage.setItem('filter-minimum', value.toString());
									setState({ ...state, filterMinimumValue: value });
									onFilterMinimum(value);
								} catch (err) {}

								// if(event.match(/\d+))
							}}
						/>
					</div>
					<div className='flex flex-col w-fit h-full bg-[#25253E] justify-start items-center rounded py-2 box-border'>
						{/* <div className='mr-2 text-1xl mb-2'>Status</div> */}
						<div className='text-1xl'>Status</div>
						<div className='w-full h-[2px] bg-gray-100 my-[4px]'>&nbsp;</div>

						<div className='flex flex-row h-full w-full justify-center items-center gap-x-2 px-4 text-1xl'>
							<div
								className='bg-[#5a5a94] rounded p-1 py-[2px] hover:opacity-50 transition-all active:opacity-30 select-none'
								onClick={() => {
									refreshStatus();
								}}
							>
								Refresh
							</div>
							<div
								className='bg-[#5a5a94] rounded p-1 py-[2px] hover:opacity-50 transition-all active:opacity-30 select-none'
								onClick={() => {
									localStorage.setItem('status-anomaly', '');
								}}
							>
								Clear
							</div>
						</div>
					</div>
				</div>

				<div className='flex flex-row justify-center items-center w-min gap-x-2 h-[100px]'>
					<div className={`flex flex-col w-[250px] bg-[#25253E] justify-start items-center rounded py-2 h-full transition-all ${state.paces.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
						<div>Pace</div>
						<div className='w-full h-[2px] bg-gray-100 my-[4px]'>&nbsp;</div>

						<div className='flex flex-col justify-center items-center h-full w-full'>
							<div>
								Range: {formatSeconds(getRemaining() * (state.pace[0] || 0))} - {formatSeconds(getRemaining() * (state.pace[1] || 0))}
							</div>
							<div>Average: {formatSeconds((state.paces.reduce((a, b) => a + b, 0) / (state.paces.length || 1)) * getRemaining())}</div>
						</div>
					</div>
					<div className={`flex flex-col w-[250px] bg-[#25253E] justify-start items-center rounded py-2 h-full transition-all`}>
						<div>Time</div>
						<div className='w-full h-[2px] bg-gray-100 my-[4px]'>&nbsp;</div>

						<div className='flex flex-col justify-center items-center h-full w-full'>
							<div>Elapsed: {formatSeconds(state.elapsed)}</div>
							<div>True Elapsed: {formatSeconds(state.trueElapsed)}</div>
						</div>
					</div>

					<div className='flex flex-col w-[350px] bg-[#25253E] justify-start items-center rounded py-2 h-full'>
						<div>Completion (minimum sum filter related)</div>
						<div className='w-full h-[2px] bg-gray-100 my-[4px]'>&nbsp;</div>

						<div className='flex flex-col justify-center items-center h-full w-full'>
							<div>
								Rate: {((getFilteredIndices().length / data.filter((item) => item.solution != null).length) * 100).toFixed(2)}% ({getFilteredIndices().length}/
								{data.filter((item) => item.solution != null).length})
							</div>
						</div>
					</div>
				</div>
			</div>
			<div ref={questions} className='w-full h-full flex flex-col gap-y-2 pt-2'>
				{data.map((question, index) => {
					if (question.solution == null) return;
					return <Question info={question} index={index} status={status[index]} onSubmit={(correct, incorrect) => onSubmit(correct, incorrect, index)} />;
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
