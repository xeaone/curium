var templateMultiline = function () {/*!@preserve

	<template>
		<p>templateMultiline</p>
	</template>

*/};

var c = Curium.component({
	tag: 'native-test',
	templateMultiline: templateMultiline
});

console.log(c.attributes);
