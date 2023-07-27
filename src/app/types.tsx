export interface QuestionType {
	question: string;
	answers: string[];
	true: string;
	status: string;
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
