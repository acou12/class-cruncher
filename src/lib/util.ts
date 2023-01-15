export const fixedTime = (time: number): number => {
	return Math.floor(time / 100) * 60 + (time % 100);
};

export const humanTime = (time: number): string => {
	const hour = Math.floor(time / 60);
	const [fixedHour, am] =
		hour < 12 ? [hour, true] : hour == 12 ? [hour, false] : [hour - 12, false];
	const minute = time % 60;
	return `${fixedHour}:${minute.toString().padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
};

export const randomColor = (): string =>
	Math.floor(Math.random() * 0xffffff)
		.toString(16)
		.padStart(6, '0');

/**
 * rough hash of a course name to make colors consistent across sessions.
 */
export const stringColor = (s: string): string => {
	let n = 0;
	// todo: deprecated; use buffers
	for (const c of btoa(s)) {
		n *= 36;
		n += c.charCodeAt(0);
		n %= 0xffffff;
	}
	return n.toString(16).padStart(6, '0');
};

// fear

// export const superCartesianProduct = <T>(sets: T[][]): T[][] => {
//   const result = []
//   eval(
//     sets.map((set, i) => `for (let _${i} = 0; _${i} < ${set.length}; _${i}++)`).join('\n') +
//       `result.push([${sets.map((_set, i) => `sets[_${i}]`).join(', ')}])`
//   )
//   return result
// }

const TRUE = true;

export const superCartesianProduct = <T>(sets: T[][]): T[][] => {
	if (sets.length === 0) return [];
	const result: T[][] = [];
	const indices = new Array(sets.length).fill(0);
	// todo: kill eslint
	while (TRUE) {
		result.push(indices.map((i, j) => sets[j][i]));

		let row = sets.length - 1;
		indices[row]++;
		while (indices[row] === sets[row].length) {
			if (row === 0) return result;
			indices[row] = 0;
			row--;
			indices[row]++;
		}
	}
	throw Error('uhh');
};

export const randomSubset = <T>(ts: T[]): T[] => {
	return ts.flatMap((x) => (Math.random() < 0.5 ? [x] : []));
};

export const randomElement = <T>(ts: T[]): T => {
	return ts[Math.floor(Math.random() * ts.length)];
};

export const shuffled = <T>(arr: T[]): T[] => {
	const copy = [...arr];
	const result: T[] = [];
	while (copy.length > 0) {
		const index = Math.floor(Math.random() * copy.length);
		result.push(copy[index]);
		copy.splice(index, 1);
	}
	return result;
};

export const unique = <T>(arr: T[]): T[] => {
	const result: T[] = [];
	for (const t of arr) {
		if (!result.includes(t)) result.push(t);
	}
	return result;
};

export const uniqueBy = <T>(arr: T[], equals: (t1: T, t2: T) => boolean): T[] => {
	const result: T[] = [];
	for (const t of arr) {
		if (!result.some((other) => equals(t, other))) result.push(t);
	}
	return result;
};
