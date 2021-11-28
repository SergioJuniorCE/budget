<script>
	let title = 'Product Title';
	let descripion =
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed rhoncus, nisl placerat rhoncus dapibus, quam elit fermentum nulla, vitae iaculis sapien massa id metus. Donec vel orci volutpat, ullamcorper nisi vel, porttitor nisl. Donec nisi lacus, lacinia eu sapien et, pretium accumsan purus. Nulla lobortis, risus ut ultrices facilisis, neque neque ullamcorper nunc, ac lobortis ex tellus eget diam. Aliquam erat volutpat. Sed in turpis ut risus sagittis tincidunt eget at metus. Donec ut fringilla mauris, nec finibus velit.';
  let image = "https://picsum.photos/322"
  let price = 29.99
</script>

<div class="mx-3 py-2">
  <div class="text-center">
    <img src="{image}" alt="{title} image">
    <div class="text-start">
      <h5 class="bold">{title}</h5>
    <p class="bold">${price}</p>
    </div>
  </div>
</div>

<style>
  .bold {
    font-weight: bold;
  }
</style>
