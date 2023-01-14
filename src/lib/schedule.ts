import { fixedTime, randomColor, randomElement, shuffled } from '../lib/util';

class Course {
	constructor(
		public name: string,
		public color: string,
		public hours: number,
		public sections: Section[]
	) {}
}

class Location {
	constructor(public name: string, public coords: Coordinates[number]['coords'] | undefined) {}

	distance(other: Location) {
		// todo: compare accuracy with spherical taxicab distance
		// todo 2: use google maps distance matrix for a more accurate distance

		if (this.coords === undefined || other.coords === undefined) return Infinity;

		// https://en.wikipedia.org/wiki/Great-circle_distance#Computational_formulas
		const deltaLambda = other.coords.lng - this.coords.lng;
		const deltaPhi = other.coords.lat - this.coords.lat;
		// prettier-ignore
		return (
			2 *
			Math.asin(
				Math.sqrt(
					Math.pow(
						Math.sin(deltaPhi / 2), 
					2)
					+ (
						1 
						- Math.pow(
							Math.sin(deltaPhi / 2), 
						2) 
						- Math.pow(
							Math.sin((this.coords.lat + other.coords.lat) / 2), 
						2)
					) * (
						Math.pow(
							Math.sin(deltaLambda / 2),
						2)
					)
				)
			)
		);
	}
}

export class Section {
	constructor(public id: string, public meetings: Meeting[], public parentCourse: Course) {}
}

export class Meeting {
	constructor(
		public startTime: number,
		public endTime: number,
		public day: string,
		public location: Location,
		public parentSection: Section
	) {}
}

const googleAddress = (address: string) =>
	address.replace(/ [a-zA-Z]?[0-9]+$/, '') + ', Columbus, OSU';

class Day {
	constructor(public meetings: Meeting[]) {}

	gaps(): number[] {
		const result = [];
		this.meetings.sort((x, y) => x.startTime - y.startTime);
		for (let i = 0; i < this.meetings.length - 1; i++) {
			result.push(this.meetings[i + 1].startTime - this.meetings[i].endTime);
		}
		return result;
	}

	distances(): number[] {
		const result = [];
		this.meetings.sort((x, y) => x.startTime - y.startTime);
		for (let i = 0; i < this.meetings.length - 1; i++) {
			result.push(this.meetings[i + 1].location.distance(this.meetings[i].location));
		}
		return result;
	}

	generateIFrameLink(): string {
		if (this.meetings.length === 0) return '';
		this.meetings.sort((x, y) => x.startTime - y.startTime);
		let start = googleAddress(this.meetings[0].location.name);

		let end: string | undefined = undefined;
		if (this.meetings.length > 1) {
			end = googleAddress(this.meetings[this.meetings.length - 1].location.name);
		}

		let waypoints: string[] | undefined = undefined;
		if (this.meetings.length > 2) {
			waypoints = this.meetings
				.slice(1, this.meetings.length - 1)
				.map((meeting) => googleAddress(meeting.location.name));
		}
		return `https://www.google.com/maps/embed/v1/directions?key=AIzaSyC1b5ar7tO-7uOvl_0V7j-Mw0_wML-XzPI
						&origin=${start}
						${waypoints === undefined ? '' : `&waypoints=${waypoints.join('|')}`}
						&destination=${end === undefined ? start : end}
						&mode=walking`;
	}
}

export class Schedule {
	constructor(public id: string, public days: Day[], public sections: Section[]) {}

	allMeetings(): Meeting[] {
		return this.days.flatMap((day) => day.meetings);
	}

	valid(): boolean {
		return !this.days.some((day) =>
			day.meetings.some((m1) =>
				day.meetings.some(
					(m2) =>
						m1 !== m2 &&
						((m1.startTime <= m2.startTime && m2.startTime <= m1.endTime) ||
							(m1.startTime <= m2.endTime && m2.endTime <= m1.endTime))
				)
			)
		);
	}

	// Some heuristics.

	totalGaps(): number {
		const gaps = this.days.flatMap((day) => day.gaps());
		return [0, ...gaps].reduce((acc, x) => acc + x);
	}

	averageGaps(): number {
		const gaps = this.days.flatMap((day) => day.gaps());
		return [0, ...gaps].reduce((acc, x) => acc + x) / gaps.length;
	}

	totalDistances(): number {
		const distances = this.days.flatMap((day) => day.distances());
		return [0, ...distances].reduce((acc, x) => acc + x);
	}

	averageDistances(): number {
		const distances = this.days.flatMap((day) => day.distances());
		return [0, ...distances].reduce((acc, x) => acc + x) / distances.length;
	}

	cohesivity(): number {
		const courses = this.sections.map((section) => section.parentCourse.name.split(' ')[0]);
		const uniqueCourses: string[] = [];
		for (const course of courses)
			if (!uniqueCourses.some((otherCourse) => course === otherCourse)) uniqueCourses.push(course);
		return uniqueCourses.length;
	}

	deviation(): number {
		const meetings = this.days.map((day) =>
			[0, ...day.meetings.map((meeting) => meeting.endTime - meeting.startTime)].reduce(
				(acc, x) => acc + x
			)
		);
		const mean = [0, ...meetings].reduce((acc, x) => acc + x) / meetings.length;
		return [0, ...meetings.map((meeting) => Math.pow(meeting - mean, 2))].reduce(
			(acc, x) => acc + x
		);
	}

	fridayLast(): number {
		return Math.max(...this.days[4].meetings.map((meeting) => meeting.endTime));
	}

	maxEndTime(): number {
		const lasts = this.days.map((day) =>
			Math.max(...day.meetings.map((meeting) => meeting.endTime))
		);
		return Math.max(...lasts);
	}

	minimallyGapped(): boolean {
		const gaps = this.days.flatMap((day) => day.gaps());
		return gaps.every((gap) => gap <= 15);
	}

	totalHours(): number {
		return [0, ...this.sections.map((section) => section.parentCourse.hours)].reduce(
			(acc, x) => acc + x
		);
	}
}

type Data = {
	sections: {
		id: string;
		subjectId: string;
		course: string;
		creditsMax: number;
		meetings: {
			days: string;
			daysRaw: string;
			startTime: number;
			endTime: number;
			location: string;
		}[];
	}[];
	schedules: {
		id: string;
		combination: string[];
	}[];
};

// const scheduleFromSectionSet = (sections: Data['sections']): Schedule => {
//   const days: Record<string, Day> = {
//     M: new Day([]),
//     T: new Day([]),
//     W: new Day([]),
//     R: new Day([]),
//     F: new Day([])
//   }

//   sections.forEach((section) => {
//     section.meetings.forEach((meeting) => {
//       for (let i = 0; i < meeting.daysRaw.length; i++) {
//         days[meeting.daysRaw.charAt(i)].meetings.push(
//           new Meeting(
//             fixedTime(meeting.startTime),
//             fixedTime(meeting.endTime),
//             courses[`${section.subjectId} ${section.course}`]
//           )
//         )
//       }
//     })
//   })

//   const schedule = new Schedule(Object.values(days), Object.values(courses))

//   return schedule
// }

// export const randomSchedule = (): Schedule => {
//   const selectedSections: Data['sections'] = []

//   Object.keys(rawSections).forEach((sectionName) => {
//     if (Math.random() < 0.5) {
//       const sectionSet = rawSections[sectionName]
//       selectedSections.push(sectionSet[Math.floor(Math.random() * sectionSet.length)])
//     }
//   })

//   if (
//     selectedSections.length === 0 ||
//     selectedSections.map((section) => section.creditsMax).reduce((acc, x) => acc + x) != 18
//   )
//     return randomSchedule()

//   const schedule = scheduleFromSectionSet(selectedSections)

//   if (!schedule.valid()) {
//     return randomSchedule()
//   }

//   return schedule
// }

type SectionMap = Record<string, Data['sections']>;
type Coordinates = { name: string; coords: { lat: number; lng: number } }[];

export type SerializedSchedule = {
	sectionIds: string[];
};

export const courses: Course[] = [];

export const initialize = async (
	sectionMap: SectionMap,
	coordinates: Coordinates
): Promise<void> => {
	const rawSections: SectionMap = sectionMap;

	// const locations = unique(
	// 	Object.values(rawSections)
	// 		.flatMap((sections) =>
	// 			sections.flatMap((section) => section.meetings.flatMap((meeting) => meeting.location))
	// 		)
	// 		.map((location) => location.replace(/ [a-zA-Z]?[0-9]+$/, ''))
	// );

	const coordinatesFromLocation = (name: string) => {
		const matching = coordinates.find((c) => name.startsWith(c.name));
		if (matching !== undefined) return matching.coords;
		else return undefined;
	};

	for (const sectionName in rawSections) {
		const sections = rawSections[sectionName];
		const course = new Course(sectionName, randomColor(), sections[0].creditsMax, []);
		for (const rawSection of sections) {
			if (
				rawSection.meetings.some(
					(meeting) => meeting.daysRaw.includes('U') || meeting.daysRaw.includes('S')
				)
			)
				continue;
			// todo: better id
			const section = new Section(
				`${rawSection.subjectId}${rawSection.course}${rawSection.meetings
					.map((meeting) => `${meeting.daysRaw}${meeting.startTime}${meeting.endTime}`)
					.join('-')}`,
				[],
				course
			);
			section.meetings.push(
				...rawSection.meetings.flatMap((meeting) =>
					meeting.daysRaw
						.split('')
						.map(
							(day) =>
								new Meeting(
									fixedTime(meeting.startTime),
									fixedTime(meeting.endTime),
									day,
									new Location(meeting.location, coordinatesFromLocation(meeting.location)),
									section
								)
						)
				)
			);
			course.sections.push(section);
		}
		courses.push(course);
	}

	// allSchedules = Array(500)
	//   .fill(0)
	//   .map(() => randomSchedule())
	//   .filter((schedule) => schedule.valid())
	//   .filter((schedule) => schedule.totalHours() === 30)

	// allSchedules.sort((x, y) => +(x.averageGaps() - y.averageGaps()))
	// allSchedules.sort((x, y) => +(x.cohesivity() - y.cohesivity()))
	// allSchedules.sort((x, y) => x.maxEndTime() - y.maxEndTime())
	// allSchedules.sort((x, y) => +(x.totalGaps() - y.totalGaps()))
	// allSchedules.sort((x, y) => -(x.deviation() - y.deviation()))
	// allSchedules.sort((x, y) => +(x.fridayLast() - y.fridayLast()))
	// allSchedules.sort((x, y) => -(x.totalHours() - y.totalHours()))

	// console.log(allSchedules)
};

export const serialize = (schedule: Schedule): SerializedSchedule => {
	return {
		sectionIds: schedule.sections.map((section) => section.id)
	};
};

export const deserialize = (jschedule: SerializedSchedule) => {
	const allSections = courses.flatMap((course) => course.sections);
	const sections = jschedule.sectionIds.map((id) =>
		allSections.find((section) => section.id === id)
	);
	if (sections.some((section) => section === undefined))
		throw Error('Invalid schedule was deserialized.');
	return scheduleFromSections(sections as Section[]);
};

export const scheduleFromSections = (sections: Section[]): Schedule => {
	const days: Record<string, Day> = {
		M: new Day([]),
		T: new Day([]),
		W: new Day([]),
		R: new Day([]),
		F: new Day([])
	};
	sections
		.flatMap((section) => section.meetings)
		.forEach((meeting) => {
			days[meeting.day].meetings.push(meeting);
		});
	return new Schedule(idFromSections(sections), Object.values(days), [...sections]);
};

const idFromSections = (s: Section[]): string => {
	const sections = [...s];
	sections.sort((a, b) => a.id.localeCompare(b.id));
	return sections.map((section) => section.id).join('--');
};

export const randomSchedule = (hours: number): Schedule => {
	const sections = [];
	for (const course of shuffled(courses)) {
		for (const section of shuffled(course.sections).filter(
			(section) => section.meetings.length > 0
		)) {
			const schedule = scheduleFromSections([...sections, section]);
			if (schedule.valid()) {
				sections.push(section);
				break;
			}
		}
		if (scheduleFromSections(sections).totalHours() >= hours) break;
	}
	return scheduleFromSections(sections);
};

export const PROGRESS_PRECISION = 100;

export const generateSchedules = async (
	num: number,
	hours: number,
	progress: (n: number) => void
): Promise<Schedule[]> => {
	const result: Schedule[] = [];
	let lastPercent = 0;
	progress(0);
	for (let i = 0; i < num; i++) {
		result.push(randomSchedule(hours));
		const percent = Math.floor((i / num) * PROGRESS_PRECISION) / PROGRESS_PRECISION;
		if (percent > lastPercent) {
			progress(percent);
		}
	}
	return result
		.filter((schedule) => schedule.valid())
		.filter((schedule) => schedule.totalHours() === hours);
};

export const randomSection = () => {
	const allSections = courses.flatMap((course) => course.sections);
	return randomElement(allSections);
};

export const sortingHeuristics: {
	name: string;
	sort(schedule: Schedule): number;
}[] = [
	{
		name: 'Random',
		sort(_schedule: Schedule) {
			return Math.random();
		}
	},
	{
		name: 'Gaps',
		sort(schedule: Schedule) {
			return schedule.totalGaps();
		}
	},
	{
		name: 'Last Time',
		sort(schedule: Schedule) {
			return schedule.maxEndTime();
		}
	},
	{
		name: 'Friday',
		sort(schedule: Schedule) {
			return schedule.fridayLast();
		}
	},
	{
		name: 'Variance',
		sort(schedule: Schedule) {
			return -schedule.deviation();
		}
	},
	{
		name: 'Cohesivity',
		sort(schedule: Schedule) {
			return schedule.cohesivity();
		}
	},
	{
		name: 'Hours',
		sort(schedule: Schedule) {
			return -schedule.totalHours();
		}
	},
	{
		name: 'Distance',
		sort(schedule: Schedule) {
			return schedule.averageDistances();
		}
	}
];
