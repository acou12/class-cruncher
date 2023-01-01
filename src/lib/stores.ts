import { writable } from 'svelte/store';
import type { Schedule } from './schedule';
import type { Writable } from 'svelte/store';

export const schedules: Writable<Schedule[] | undefined> = writable([]);
