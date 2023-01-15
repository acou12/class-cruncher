<script>
	export let dimensions = '100px';
</script>

<div class="spinner" style="width: {dimensions}" />

<style lang="scss">
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.spinner {
		background-color: orange;
		aspect-ratio: 1/1;
		/* width: 100px;
		height: 100px; */
		animation: spin 3s infinite;
	}
</style>
