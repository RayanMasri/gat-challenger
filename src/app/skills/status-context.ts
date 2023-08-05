import React, { useState } from 'react';
interface StatusType {
	status: { id: number; data: [number, number] }[];
}

let object: StatusType = {
	status: [],
};

const Contexta = React.createContext({
	context: object,
	setContext: (e: StatusType) => {},
});

const ContextProvider = (props: any) => {
	const [context, setContext] = useState(object);
	return <Context.Provider value={{ context, setContext }}>{props.children}</Context.Provider>;
};
