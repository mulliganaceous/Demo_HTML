// JavaScript source code.
document.writeln("JS External file");
// Function which utilizes an array and a for loop.
function getArray() {
    var list = [];
    var K = 1000;
    for (var k = 0; k < K; k++) {
        list.push(k);
    }
    return list.toString();
}
// Print the output of that function to the document.
var liststr = getArray();
document.writeln(liststr);