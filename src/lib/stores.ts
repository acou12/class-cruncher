import { writable } from 'svelte/store';
import type { Course, Schedule } from './schedule';
import type { Writable } from 'svelte/store';

export const schedules: Writable<Schedule[] | undefined> = writable([]);
export const selectedCourses: Writable<Course[]> = writable([]);

const defaultSettings = {
	hours: '18',
	sort: 'Gaps',
	total: '3000'
};

export type Settings = typeof defaultSettings;

export const settings = writable(defaultSettings);
