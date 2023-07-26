import './globals.css';
import { ContextProvider } from './context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ContextProvider>
			<html lang='en'>
				<body>{children}</body>
			</html>
		</ContextProvider>
	);
}
