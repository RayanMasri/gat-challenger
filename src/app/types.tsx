export interface QuestionType {
	question: string;
	answers: string[];
	true: string;
	status: string;
	notes?: string;
	selected?: boolean;
	index?: number;
}

export interface ParagraphType {
	title: string;
	url: string;
	index: number;
	paragraph: string;
	notes?: string;
	questions: QuestionType[];
}

export interface ModelType {
	name: string;
	video?: string;
	instant_evaluation?: boolean;
	questions: QuestionType[];
}

export interface StatusTuple extends Array<number | number> {
	0: number;
	1: number;
}

export interface StatusTupleVerbose {
	correct: number;
	incorrect: number;
	question: string;
	answer: string;
}

export interface AnomalyStatusTuple {
	correct: number;
	incorrect: number;
	answers: string[];
	solution: string | null;
}

export interface AnomalyAnswerType {
	content: string;
	meaning: string;
}

export interface AnomalyQuestionType {
	answers: AnomalyAnswerType[];
	solution: string | null;
	perception?: string;
	categories?: string[];
}
