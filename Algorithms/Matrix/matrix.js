function Vector(n) {
	// Initialize a new vector.
	this.dim = n;
	this.entry = new Array(n);

}

function Matrix(m, n) {
	// Initialize a new 2D array
	this.rows = m
	this.cols = n
	this.entry = new Array(m)
	// Private variables
	var rowechelon;
	var rank;
	var determinant;

	for (var i = 0; i < m; i++) {
		this.entry[i] = new Array(n)
	}

	function assign(A, i, j, value) {
		A.entry[i][j] = value;
	}

	/* Arithmetic Functions */
	this.add = function (term) {
		if (!(term instanceof Matrix))
			throw new Error("Term must be a " + this.rows + " � " + this.cols + "matrix!")
		if (term.rows != this.rows || term.cols != this.cols)
			throw new Error("Incompatible matrices! " + [this.rows, term.rows, this.cols, term.cols])
		var sum = matrix(this.rows, this.cols)
		for (var i = 0; i < m; i++) {
			for (var j = 0; j < n; j++) {
				// Perform sum for that entry
				sum.entry[i][j] = add(this.entry[i][j], term.entry[i][j])
			}
		}
		return sum
	}

	this.multiply = function (factor) {
		/* Deal with cases where the other factor is not a Matrix */
		if (typeof (factor) === "bigint" || typeof (factor) === "number") {
			var v = this.cols
			var product = matrix(this.rows, factor.cols)
			for (var i = 0; i < m; i++) {
				for (var j = 0; j < n; j++) {
					product.entry[i][j] = multiply(this.entry[i][j],factor);
				}
			}
			return product
		}
		else if(!(factor instanceof Matrix))
			throw new Error("Term must be a Matrix or a scalar!")
		else if (this.cols != factor.rows)
			throw new Error("Incompatible matrices! " + [this.cols, factor.rows])

		var v = this.cols;
		var product = matrix(this.rows, factor.cols)
		for (var i = 0; i < m; i++) {
			for (var j = 0; j < n; j++) {
				for (var k = 0; k < v; k++) {
					// := K[i][j] += A[i][k] * B[k][j]
					product.entry[i][j] = add(product.entry[i][j], multiply(this.entry[i][k], factor.entry[k][j]));
				}
			}
		}
		return product
	}

	this.t = function () {
		var transpose = matrix(this.cols, this.rows)
		for (var i = 0; i < m; i++) {
			for (var j = 0; j < n; j++) {
				transpose.entry[j][i] = this.entry[i][j];
			}
		}
		return transpose;
	}

	this.reduce_fractions = function() {
		for (var i = 0; i < m; i++) {
			for (var j = 0; j < n; j++) {
				this.entry[i][j].reduce()
			}
		}
		return this
	}

	/* CLOSURES */
	this.toEchelon = function () {
		if (rowechelon === undefined) {
			rowechelon = echelonform(this);
		}
		return rowechelon;
	}

	this.getRank = function () {
		if (rank !== undefined)
			return rank;
		if (rowechelon === undefined) {
			rowechelon = this.toEchelon();
		}
		for (var k = 0; k < this.rows && k < this.cols; k++) {
			if (rowechelon.entry[k][k] == 0)
				return k;
		}
		return k;
    }

	this.getDet = function () {
		// Only need to calculate once.
		if (determinant !== undefined)
			return determinant;
		determinant = det(this);
		return determinant;
	}

	/* CLONEABLE */
	this.clone = function () {
		var cloned = matrix(this.rows, this.cols);
		for (var i = 0; i < m; i++) {
			for (var j = 0; j < n; j++) {
				cloned.entry[i][j] = this.entry[i][j];
			}
		}
		return cloned;
	}

	/* DEMO FUNCTIONS */
	this.demo = function () {
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				this.entry[i][j] = "(" + i + "," + j + ")"
	}

	this.toString = function () {
		var str = ""
		for (var i = 0; i < m; i++) {
			rowstr = []
			rowstr.push("[ ")
			for (var j = 0; j < n; j++) {
				entry = this.entry[i][j];
				if (typeof (entry) == "number")
					entry = Number(entry).toFixed(3);
				else if (_isExactForm(entry)) {
					entry = approxString(_toRational(entry), 3);
                }
				rowstr.push(entry + " ")
			}
			rowstr.push("]")
			str += rowstr.join("") + "<br/>"
		}
		return str
	}
}

/* SCALAR ARITHMETIC */
/* The defined exact expressions currently include BigInts and Rationals. */
function _isExactForm(k) {
	if (k instanceof Rational || typeof (k) == "bigint")
		return true;
	return false;
}

/**Express the numerical entity in approximate form. It is used
 * if any of the inputs are approximate.
 * @param {any} k
 */
function _approx(k) {
	if (k instanceof Rational)
		return k.approx(1)
	return Number(k)
}

/* SCALAR ARITHMETIC FUNCTIONS */
/* Values are considered exact if the inputs are all exact. */
function add(a, b) {
	if (b == 0)
		return a;
	if (!_isExactForm(a) || !_isExactForm(b))
		return _approx(a) + _approx(b) // Convert them into Numbers, then add as a Number
	else {
		if (a == 0 || typeof (a) == "bigint")
			a = Q(BigInt(a), 1)
		var sum = a.add(b).reduce();
		if (sum.integral())
			sum = sum.n;
		return sum;
    }
}

function multiply(a, b) {
	// Instantly deal with zero cases
	if (b === 0n)
		return 0n;
	if (b === 0)
		return 0;

	if (!_isExactForm(a) || !_isExactForm(b))
		return _approx(a) * _approx(b) // Convert them into Numbers, then add as a Number
	else {
		if (typeof (a) == "bigint")
			a = Q(a, 1);
		var product = a.multiply(b).reduce();
		if (product.integral())
			product = product.n;
		return product;
	}
}

function divide(a, b) {
	if (!_isExactForm(a) || !_isExactForm(b))
		return _approx(a) / _approx(b) // Convert them into Numbers, then add as a Number
	else {
		if (typeof (a) == "bigint")
			a = Q(a, 1);
		var product = a.divide(b).reduce();
		if (product.integral())
			product = product.n;
		return product;
	}
}

/* MATRIX DERIVATIONS */
function echelonform(A, leading=false) {
	var echelonform = A.clone();
	var detsign = 1n;

	var _swaprows = function (row1, row2) {
		for (var j = 0; j < echelonform.cols; j++) {
			SWAP = echelonform.entry[row1][j];
			echelonform.entry[row1][j] = echelonform.entry[row2][j];
			echelonform.entry[row2][j] = SWAP;
		}
		detsign *= -1n; // Each swap reverses sign of determinant.
	}

	var _addrows = function (ratio, row, target) {
		for (var j = 0; j < echelonform.cols; j++) {
			echelonform.entry[target][j] =
				add(echelonform.entry[target][j], multiply(ratio, echelonform.entry[row][j]));
		}
	}

	/* After each iteration, all entries below or leftwards of [row][col] are zero. */
	var row = 0;
	var col = 0;
	while (row < echelonform.rows && col < echelonform.cols) {
		/* If the current entry is zero, swap rows such that a row below with a nonzero entry
		 * is swapped. The rule is that for that row-column, no rows below can have entries
		 * left from the column being nonzero. Perform a swap if possible; else entries below are zero. */
		var zerocol = false;
		if (echelonform.entry[row][col] == 0) {
			// The intended leftmost row cannot be used until a swap is made.
			zerocol = true;
			for (var target = row + 1; target < A.rows && zerocol; target++) {
				// Search all lower rows and find the first swappable one.
				if (echelonform.entry[target][col] != 0) {
					_swaprows(row, target);
					zerocol = false;
				}
			}
		}

		if (zerocol) // If the entries directly below are all zero, consider the next entry.
			col += 1
		else { // Eliminate these rows, move on diagonally.
			// Row is occupied or now occupied. Note the entry concerned must not be 0.
			var leftmost = echelonform.entry[row][col];
			for (var target = row + 1; target < A.rows && leftmost != 0; target++) {
				ratio = divide(echelonform.entry[target][col], echelonform.entry[row][col]);
				ratio = multiply(ratio, -1n);
				_addrows(ratio, row, target);
			}

			row += 1 // Advance to next row. Note the col number of the next row is always 0.
			col += 1
        }
	}
	if (leading)
		return [echelonform, detsign];
	return echelonform;
}

function reducedform(A, leading = false) {
	var reduced = echelonform(A).clone();

	var _addrows = function (ratio, row, target) {
		for (var j = 0; j < reduced.cols; j++) {
			reduced.entry[target][j] = add(reduced.entry[target][j], multiply(ratio, reduced.entry[row][j]));
		}
	}

	var _multrows = function (ratio, row) {
		for (var j = 0; j < reduced.cols; j++) {
			reduced.entry[row][j] = multiply(reduced.entry[row][j], ratio)
		}
	}

	for (var row = 0; row < reduced.rows; row++) {
		col = 0;
		while (col < reduced.cols) {
			if (reduced.entry[row][col] != 0) {
				for (var target = row - 1; target >= 0; target--) {
					ratio = divide(reduced.entry[target][col], reduced.entry[row][col]);
					ratio = multiply(ratio, -1n);
					_addrows(ratio, row, target);
				}
				if (leading)
					_multrows(divide(1n, reduced.entry[row][col]), row)
				// Terminate while loop early
				col = reduced.cols;
			}
			col++;
        }
    }
	return reduced;
}

function submatrix(A, topleft, bottomright) {
	var sub_rows = bottomright[0] - topleft[0] + 1;
	var sub_cols = bottomright[1] - topleft[1] + 1;
	var sub = matrix(sub_rows, sub_cols, []);
	for (var i = 0; i < sub_rows; i++) {
		for (var j = 0; j < sub_cols; j++) {
			sub.entry[i][j] = A.entry[topleft[0]+i][topleft[1]+j]; // Index offset by topleft coordinates
        }
	}
	return sub;
}

/* SQUARE MATRIX FUNCTIONS */
function det(A) {
	if (A.rows != A.cols) {
		return NaN;
	}
	const data = echelonform(A, leading = true);
	var echelon = data[0];
	var product = data[1];
	for (var k = 0; k < A.rows && product != 0; k++)
		product = multiply(product, echelon.entry[k][k])
	return product;
}

function tr(A) {
	var sum = 0n;
	for (var k = 0; k < A.rows && k < A.cols; k++) {
		sum = add(sum, A.entry[k][k]);
	}
	return sum;
}

function inverse(A) {
	if (A.rows != A.cols) {
		return NaN;
	}
	var list = Array(A.rows * 2 * A.cols);
	var index = 0;
	for (var i = 0; i < A.rows; i++) {
        for (var j = 0; j < A.rows; j++) {
			list[index] = A.entry[i][j];
			index++;
		}
		for (j; j < 2 * A.rows; j++) {
			if (i == j - A.rows)
				list[index] = 1n;
			else
				list[index] = 0n;
			index++;
        }
	}

	var augmented = matrix(A.rows, 2 * A.cols, list);
	augmented = reducedform(augmented, leading=true);
	for (var k = 0; k < augmented.rows; k++)
		if (augmented.entry[k][k] == 0)
			return NaN; // Undefined

	return submatrix(augmented,[0,A.rows],[A.rows-1,2*A.rows-1]);
}

/**
 * 
 * @param {any} m
 * @param {any} n
 */
function matrix(m, n, list) {
	var M;
	if (n == undefined)
		M = new Matrix(m, m)
	else
		M = new Matrix(m, n)

	if (list) {
		var k = 0;
		for (var i = 0; i < M.rows; i++) {
			for (var j = 0; j < M.cols; j++) {
				M.entry[i][j] = list[k];
				k += 1;
			}
		}
	}
	else {
		for (var i = 0; i < M.rows; i++) {
			for (var j = 0; j < M.cols; j++) {
				M.entry[i][j] = 0n
			}
		}
    }

	return M;
}

function O(m, n) {

}

function I(m, n) {

}

function __omg1() {
	console.log(Q(1, 2) instanceof Rational)
	console.log(Q(3,4).d)
}