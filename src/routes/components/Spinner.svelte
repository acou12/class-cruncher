<div class="spinner" />

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
		width: 100px;
		height: 100px;
		animation: spin 3s infinite;
	}
</style>
