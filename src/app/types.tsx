export interface ParagraphQuestion {
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
	questions: ParagraphQuestion[];
}

export interface StatusTuple extends Array<number | number> {
	0: number;
	1: number;
}
