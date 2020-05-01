/**Constructor for a Rational object. 
 * The Rational object allows us to express a rational number exactly.
 * The rational is initialized as a numerator over a denominator, not necessarily in lowest terms.
 * 
 * The rational stores two BigInts. Please avoid inputting ordinary number literals
 * as numerators and denominators as the conversion takes place after the approximation.
 * 
 * Please note that JavaScript does not support operator overloading.
 * Static and instance versions of rational number arithmetic are supported.
 * Please note that rational objects are mutable, but arithmetic functions always
 * yield a new Rational value.
 * 
 * Currently, "infinite" Rationals of form n⁄0 are not supported, along with the
 * indeterminate 0⁄0; these are more properly referred as poles in complex analysis.
 * 
 * @param {BigInt} numerator The numerator of the Rational.
 * @param {BigInt} denominator The denominator of the Rational, which may not be zero.
 */
function Rational(numerator, denominator) {
	if (!denominator)
		throw new RangeError("Zero denominator upon initializing Rational")
	this.n = BigInt(numerator);
	this.d = BigInt(denominator);

	/**Reduces the Rational to lowest terms.
	 * Note this function changes the Rational to an equivalent form.
	 */
	this.reduce = function () {
		var GCD = gcd(this.n, this.d);
		this.n /= GCD;
		this.d /= GCD;
		if (this.d < 0n) {
			this.n *= -1n;
			this.d *= -1n;
		}

		return this;
	}

	/**Creates an equivalent Rational in lowest terms.
	 * It is not to be confused with reduce() which change the object itself.
	 */
	this.canonical = function () {
		var reduced = this.clone();
		reduced.reduce();
		return reduced;
	}

	/**Determine if the other Rational or BigInt is equal to this rational number.
	 * @param {any} other
	 */
	this.equals = function(other) {
		other = _toRational(other);
		return this.n*other.d == this.d*other.n; // Cross multiply
    }

	/**Perform an addition
	 * @param {Rational, BigNum} term
	 */
	this.add = function (term) {
		if (term instanceof Rational) {
			var GCD = gcd(this.d, term.d); // Find lowest common multiple to equate denominators.
			var LCM = this.d * term.d / GCD;
			var r = [LCM / this.d, LCM / term.d]; // Prevents more multiplications and preserves sign.
			return new Rational(r[0] * this.n + r[1] * term.n, LCM);
		}
		else if (typeof (term) == "bigint") {
			return new Rational(this.n + this.d * term, this.d);
		}
	}

	/**
	 * @param {Rational, BigNum} term
	 */
	this.subtract = function (term) {
		if (term instanceof Rational) {
			return this.add(term.multiply(-1n));
		}
		else if (typeof (term) == "bigint") {
			return new Rational(this.n - this.d * term, this.d);
		}
	}

	/**
	 * @param {Rational, BigNum} factor
	 */
	this.multiply = function (factor) {
		if (factor instanceof Rational)
			return new Rational(this.n * factor.n, this.d * factor.d);
		else if (typeof (factor) == "bigint") {
			return new Rational(this.n * factor, this.d);
		}
	}

	/**
	 * @param {Rational, BigNum} factor
	 */
	this.divide = function (factor) {
		if (factor instanceof Rational)
			return new Rational(this.n * factor.d, this.d * factor.n);
		else if (typeof (factor) == "bigint") {
			return new Rational(this.n, this.d * factor);
		}
	}

	/**
	 * @param {any} term
	 */
	this.addTo = function (term) {
		var sum = this.add(term);
		this.n = sum.n;
		this.d = sum.d;
	}

	this.multiplyBy = function (factor) {
		var product = this.multiply(factor);
		this.n = product.n;
		this.d = product.d;
	}

    /* APPROXIMATION METHODS */
	/**Determine if the Rational is an integer.
	 */
    this.integral = function () { return this.n % this.d === 0n };

	/**Obtain a list, containing the integer and fractional part of the
	 * Rational.
	 */
    this.mixedNumber = function () {
        var remainder = this.n % this.d;
        var wholepart = this.n / this.d;
        return [wholepart, Q(remainder, this.d)];
    }

	/**Creates a new Rational object with the same numerator and denominator values.
	 */
	this.clone = function () {
		return new Rational(this.n, this.d);
	}

	/**Generates a String representation of a Rational.
	 */
	this.toString = function () {
		return this.n + '⁄' + this.d;
	}

	this.approx = function (always=false) {
		if (this.integral() && !always)
			return this.n / this.d
		return Number(this.n) / Number(this.d)
    }
}

/**Performs an Euclidean algorithm on the two numbers
 * to determine the GCD.
 */
function gcd(a, b) {
	var c = a % b;
	a = b;
	b = c;
	while (b != 0n) {
		var c = a % b;
		a = b;
		b = c;
	}
	if (a < 0) // The GCD should be positive
		a *= -1n;
	return a;
}

/**Shorthand for initializing a Rational.
 * @param {any} numerator
 * @param {any} denominator
 * @param {any} reduced
 */
function Q(numerator, denominator, reduced = false) {
	if (numerator instanceof Rational || denominator instanceof Rational) {
		return _toRational(numerator, APPROXIMATE).divide(_toRational(denominator, APPROXIMATE));
    }
	var q = new Rational(numerator, denominator);
	if (reduced)
		q.reduce();
	return q;
}

/**Convert the exact number to a Rational object.
 * @param {any} k
 */
const EXACT = 0;
const APPROXIMATE = 1;
function _toRational(k, approximate = false) {
	if (k instanceof Rational)
		return k;
	if (typeof (k) === "bigint")
		return Q(k, 1n);
	else if (approximate)
		return Q(BigInt(k), 1n);
	else
		throw new TypeError("Cannot accept approximate Numbers");
	return k; // If the object is a Rational or approximate, stay as is.
}

/**Iterative method of calculating a continued fraction representation.
 * @param {Array} repr1 The integer part of the partial denominator. 
 * The last entry, if not the first, must not be zero.
 * @param {Array} repr2 The numerator of this partial denominator.
 */
function continuedFraction(repr1, repr2=[]) {
	if (repr1[repr1.length - 1] === undefined)
		return 0n;
	var q = Q(repr1[repr1.length - 1], 1n);
	for (var k = repr1.length - 2; k >= 0; k--) {
		if (repr2[k] === undefined)
			repr2[k] = 1;
		// q[k] := repr1[k] + repr2[k]/q[k+1]
		q = _toRational(repr1[k], APPROXIMATE).add(Q(repr2[k], q));
		q.reduce();
	}
	return q;
}

function approxString(q, precision = 16) {
	var approx = Number(q).toFixed(precision);
	if (_isExactForm(q)) {
		if (!(q instanceof Rational))
			q = _toRational(q);

		approx = q.approx(precision);
		if (!q.integral()) {
			approx = (approx).toFixed(precision);
			return "<abbr class=\"approx\" title=\"" + q.toString() + " ≈ " + q.approx() + "\">" + approx + "</abbr>";
		}
		else if (q.integral()) {
			approx = (approx).toFixed(0);
			return "<abbr class=\"exact\" title=\"" + q.toString() + " = " + q.approx() + "\">" + approx + "</abbr>";
		}
    }
	else
		return "~" + approx;
}

function fractionHTML(q, char = "⁄", precision=24) {
	var approx = Number(q).toFixed(precision);
	if (_isExactForm(q)) {
		if (!(q instanceof Rational))
			q = _toRational(q);

		approx = Number(q.approx()).toFixed(precision)
		if (!q.integral())
			return "<abbr class=\"exact\" title=\" ≈ " + approx + "\">" + q.toString() + "</abbr>";
		else if (q.integral())
			return "<abbr class=\"exact\" title=\" = " + approx + "\">" + q.mixedNumber()[0] + "</abbr>";
	}
	else
		return "~" + approx;
}