import { writable } from 'svelte/store';
import type { Schedule } from './schedule';

export const schedules = writable(undefined as Schedule[] | undefined);
