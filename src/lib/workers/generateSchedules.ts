import {
	courses,
	generateSchedules,
	initialize,
	randomSchedule,
	Schedule,
	serialize,
	sortingHeuristics
} from '$lib/schedule';
import sections from '../../routes/assets/data.json?raw';
import coordinates from '../../routes/assets/coordinates.json?raw';

export type Input = { total: number; hours: number; sort: string };

// todo:
// use web workers to asynchronize the generation of schedules. this will
// require creating a serialization of the schedules in raw json; this should
// be done at some point anyway if we want to impement schedule storing.

self.addEventListener('message', async (e: MessageEvent<Input>) => {
	initialize(JSON.parse(sections), JSON.parse(coordinates));
	const schedules = await generateSchedules(e.data.total, e.data.hours, (n) =>
		postMessage({ type: 'progress', n })
	);
	const heuristic = sortingHeuristics.find((heuristic) => heuristic.name === e.data.sort)!.sort;
	schedules.sort((a, b) => heuristic(a) - heuristic(b));
	postMessage({ type: 'schedules', schedules: schedules.map(serialize) });
});

export {};
