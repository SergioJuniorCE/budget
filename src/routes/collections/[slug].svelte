<script>
	import { page } from '$app/stores';
	import { range } from '../../../static/range.js';

	import ProductThumbnail from '../../components/ProductThumbnail.svelte';

	let slug = $page.params.slug;

	let product_amount = 6;
</script>

<div class="text-center">
	<h1 class="mt-4">{slug}</h1>
</div>

<div class="row">
	{#each range(0, product_amount, 1) as i}
		<div class="col">
			<ProductThumbnail />
		</div>
	{/each}
</div>
