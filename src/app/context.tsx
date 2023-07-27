'use client';
import React, { useState } from 'react';
import { QuestionType } from './types';
import data from './paragraphs/data.json';

interface ContextType {
	selected: number[][];
	collapsed: number[];
}

// Schema of context data
let object: ContextType = {
	selected: data.map((paragraph) => {
		return new Array(paragraph.questions.length).fill(-1);
	}),
	collapsed: [],
};

const Context = React.createContext({
	context: object,
	setContext: (e: ContextType) => {},
});

export function ContextProvider(props: any) {
	const [context, setContext] = useState(object);

	return <Context.Provider value={{ context, setContext }}>{props.children}</Context.Provider>;
}

export const useContext = () => React.useContext(Context);

// To use, import the provider like so "import { ContextProvider } from './Context.jsx';", and wrap it over your components
// Then, inside any of the wrapped components, add "import { useContext } from './Context.jsx';", and inside the component's function insert "const { context, setContent } = useContext();"
