// JavaScript source code
function permutation(n) {
    var g = {
        matrix: Array(n),
        order: n,

        cycle: function (cn) {
            if (cn[0] instanceof Array) {
                for (var k = 0; k < cn.length; k++) {
                    this.cycle(cn[k])
                }
            }
            else if(typeof(cn[0]) == "number") {
                swap = g.matrix[cn[0]]
                for (var k = 0; k < cn.length - 1; k++) {
                    g.matrix[cn[k]] = g.matrix[cn[k + 1]];
                }
                g.matrix[cn[cn.length - 1]] = swap;
            }
        },

        idnumber: function () {
            idn = 0n;
            for (k = 0; k < n; k++) {
                idn += BigInt(this.matrix[k]) * BigInt(n ** k);
            }
            return idn;
        }
    };
    for (var k = 0; k < n; k++)
        g.matrix[k] = k;
    return g;
}

var axis = Array(6)
// A5 rotation
axis[0] = [[1, 2, 3, 4, 5], [10, 6, 7, 8, 9]]
axis[1] = [[0, 5, 8, 9, 2], [11, 10, 3, 4, 7]]
axis[2] = [[0, 1, 9, 10, 3], [11, 6, 4, 5, 8]]
axis[3] = [[0, 2, 10, 6, 4], [11, 7, 5, 1, 9]]
axis[4] = [[0, 3, 6, 7, 5], [11, 8, 1, 2, 10]]
axis[5] = [[0, 4, 7, 8, 1], [11, 9, 2, 3, 6]]
// M12
var move = Array(2)
move[0] = [[0,1,2,4,5,7,8,10,9,6,3]]
move[1] = [[2,3],[5,6],[8,9],[10,11]]

g = permutation(12);