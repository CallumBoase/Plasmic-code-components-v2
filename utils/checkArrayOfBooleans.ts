//Helper function to check if exactly one of the values in an array is true
export function exactlyOneTrue(vals: boolean[]) {
  return vals.reduce((acc, val) => acc + (val ? 1 : 0), 0) === 1;
}

//Helper function to check if zero or exactly one of the values in an array is true
export default function zeroOrExactlyOneTrue(vals: boolean[]) {
  return vals.reduce((acc, val) => acc + (val ? 1 : 0), 0) <= 1;
}