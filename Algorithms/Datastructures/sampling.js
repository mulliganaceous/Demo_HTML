function samplefrom(array, amount) {
	sampled = Array(amount);
	for (var k = 0; k < amount; k++) {
		sampled[k] = array[k];
	}
	for (var k = amount; k < array.length; k++) {
		resultIndex = Math.random() * k;
		resultIndex = resultIndex - resultIndex % 1;
		console.log(resultIndex)
		if (resultIndex <= k)
			sampled[resultIndex] = array[k]
	}
	return sampled;
}

function shuffle(array) {
	for (var k = 0; k < array.length - 1; k++) {
		resultIndex = Math.trunc(Math.random() * (array.length - k) + k);
		SWAP = array[k];
		array[k] = array[resultIndex];
		array[resultIndex] = SWAP;
	}
	return array;
}

function shuffleresults(array, shuffles) {
	results = {};
	for (var k = 0; k < shuffles; k++) {
		x = shuffle(array);
		if (!results[x]) { results[x] = 1 }
		else { results[x] += 1 }
	}
	return results;
}
