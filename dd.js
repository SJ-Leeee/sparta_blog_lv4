const a = [43, 21, 23, 32, 12, 21, 32];

const b = JSON.stringify(a);

const c = JSON.parse(b);

console.log(b);
console.log(c[1]);
