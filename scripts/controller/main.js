
const circleFunction = (x, r) => {
	const result = Math.sqrt(r*r - x*x);

	return [result, -result];
}

const calculatePoints = (rad, step) => {
	let left = [];
	let right = [];

	for(let x = -rad; x <= rad; x += step) {
		const temp = circleFunction(x, rad);

		left.push({x: x, y: temp[0]});
		right.unshift({x: x, y: temp[1]});
	}

	return left.concat(right);
}


let data = [];
for(let r = 0; r <= 5; r++) {
	data.push(calculatePoints(r, 0.01));
}

let chartCanvas = document.getElementById("chart");
let ctx = chartCanvas.getContext('2d');

const chart = new Chart228(ctx, {
  limits: {
      x: [-7, 7],
      y: [-7, 7]
  },
  data: data
});