import { NextResponse } from 'next/server';
import fs from 'fs';

const readFile = (file: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		fs.readFile(file, 'utf8', function (err, data) {
			if (err) return reject(err);
			resolve(data);
		});
	});
};

export async function POST(request: Request) {
	console.log();
	//   const formData = await request.formData()
	//   const name = formData.get('name')
	//   const email = formData.get('email')
	const { id } = await request.json();

	let file = `${process.cwd()}/data/${id}.json`;

	let result = JSON.parse(await readFile(file));

	return NextResponse.json({ data: result });
}
