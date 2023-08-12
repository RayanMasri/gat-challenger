import { NextResponse } from 'next/server';
import fs from 'fs';
import data from '../../skills/data.json';

const readFile = (file: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		fs.readFile(file, 'utf8', function (err, data) {
			if (err) return reject(err);
			resolve(data);
		});
	});
};

const writeFile = (file: string, data: string): Promise<[string | null, boolean]> => {
	return new Promise((resolve, reject) => {
		fs.writeFile(file, data, function (err) {
			if (err) return resolve([err.toString(), false]);
			resolve([null, true]);
		});
	});
};

export async function POST(request: Request) {
	const { id } = await request.json();

	let file = `${process.cwd()}/data/${id}.json`;

	let result = JSON.parse(await readFile(file));
	let ids = data
		.map((m) => m.questions)
		.flat()
		.map((q) => q.id);

	let newIds = ids.filter((id) => !Object.keys(result).includes(id.toString()));
	let duplicates = ids.filter((id, index) => ids.indexOf(id) != index);

	if (duplicates.length != 0) {
		console.log(`Found ${duplicates.length} duplicate(s)`);
		console.log(JSON.stringify(duplicates, null, 2));
	}
	if (newIds.length != 0) {
		console.log(`Found ${newIds.length} new IDs`);

		newIds.map((id) => {
			result[id] = [0, 0];
		});

		await writeFile(file, JSON.stringify(result));
	}

	// Find duplicate IDs
	// Rearrange IDs to have consecutive

	return NextResponse.json({ data: result });
}
