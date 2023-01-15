import { writable } from 'svelte/store';
import type { Course, Schedule } from './schedule';
import type { Writable } from 'svelte/store';

export const schedules: Writable<Schedule[] | undefined> = writable([]);
export const selectedCourses: Writable<Course[]> = writable([]);
