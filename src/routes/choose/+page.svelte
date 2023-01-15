<script lang="ts">
	import { Course, courses } from '$lib/schedule';
	import { selectedCourses } from '$lib/stores';
	import { css } from '@emotion/css';

	let courseName: string;

	const addCourse = (e: Event) => {
		console.log(courses);
		const course = courses.find((course) => course.name.includes(courseName));
		if (course !== undefined && !$selectedCourses.includes(course)) {
			$selectedCourses = [...$selectedCourses, course];
			courseName = '';
		}
	};

	const deleteCourse = (course: Course) =>
		($selectedCourses = $selectedCourses.filter((it) => it !== course));
</script>

<div class="center">
	<h1>Choose your courses</h1>
	<form on:submit|preventDefault={addCourse}>
		<input type="text" bind:value={courseName} />
		<input type="submit" value="+" />
	</form>

	<ul>
		{#each $selectedCourses as course}
			<li
				class={css`
					&::before {
						background-color: #${course.color} !important;
					}
				`}
			>
				<div class="course">
					<div class="name">
						{course.name}
					</div>
					<div class="buttons">
						<button
							class="material-symbols-outlined delete button"
							on:click={() => deleteCourse(course)}>delete</button
						>
					</div>
				</div>
			</li>
		{/each}
	</ul>
</div>

<style lang="scss">
	@import '../assets/button.scss';

	li {
		list-style-type: none;
		position: relative;
		&::before {
			content: '';
			display: block;
			position: absolute;
			border-radius: 100%;
			background-color: blue;
			$dim: 15px;
			width: $dim;
			height: $dim;
			top: calc(50% - $dim / 2);
			left: -30px;
		}
	}

	.center {
		max-width: 500px;
		margin: auto;
		form {
			display: flex;
			input[type='text'] {
				width: 100%;
			}
		}
	}

	.course {
		display: flex;
		font-size: 150%;
		.buttons {
			margin-left: auto;
			.button {
				@include button(blue);
				/* aspect-ratio: 1/1; */
				border-radius: 5px;
			}
		}
	}
</style>
