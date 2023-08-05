import { NextResponse } from 'next/server';
import fs from 'fs';

const writeFile = (file: string, data: string): Promise<[string | null, boolean]> => {
	return new Promise((resolve, reject) => {
		fs.writeFile(file, data, function (err) {
			if (err) return resolve([err.toString(), false]);
			resolve([null, true]);
		});
	});
};

export async function POST(request: Request) {
	//   const formData = await request.formData()
	//   const name = formData.get('name')
	//   const email = formData.get('email')
	const { id, status } = await request.json();

	let file = `${process.cwd()}/data/${id}.json`;

	let [error, success] = await writeFile(file, JSON.stringify(status));

	if (!success) {
		console.log(`Failed to write to file ${file} with data ${JSON.stringify(status).slice(0, 200)}`);
		console.log(error);
	}

	return NextResponse.json({ success: success });
}
