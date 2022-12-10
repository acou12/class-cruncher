export const fixedTime = (time: number): number => {
  return Math.floor(time / 100) * 60 + (time % 100)
}

export const randomColor = (): string =>
  Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')

// fear

// export const superCartesianProduct = <T>(sets: T[][]): T[][] => {
//   const result = []
//   eval(
//     sets.map((set, i) => `for (let _${i} = 0; _${i} < ${set.length}; _${i}++)`).join('\n') +
//       `result.push([${sets.map((_set, i) => `sets[_${i}]`).join(', ')}])`
//   )
//   return result
// }

const TRUE = true

export const superCartesianProduct = <T>(sets: T[][]): T[][] => {
  if (sets.length === 0) return []
  const result: T[][] = []
  const indices = new Array(sets.length).fill(0)
  // todo: kill eslint
  while (TRUE) {
    result.push(indices.map((i, j) => sets[j][i]))

    let row = sets.length - 1
    indices[row]++
    while (indices[row] === sets[row].length) {
      if (row === 0) return result
      indices[row] = 0
      row--
      indices[row]++
    }
  }
  throw Error('uhh')
}

export const powerset = <T>(set: T[]): T[][] => {
  const result: T[][] = []
  const binarySet = Array(set.length).fill(0)
  while (TRUE) {
    const element: T[] = []
    for (let i = 0; i < set.length; i++) {
      if (binarySet[i] === 1) element.push(set[i])
    }
    result.push(element)
    let row = set.length - 1
    binarySet[row]++
    while (binarySet[row] === 2) {
      if (row === 0) return result
      binarySet[row] = 0
      row--
      binarySet[row]++
    }
  }
  return result
}

export const randomSubset = <T>(ts: T[]): T[] => {
  return ts.flatMap((x) => (Math.random() < 0.5 ? [x] : []))
}

export const randomElement = <T>(ts: T[]): T => {
  return ts[Math.floor(Math.random() * ts.length)]
}

export const shuffled = <T>(arr: T[]): T[] => {
  const copy = [...arr]
  const result: T[] = []
  while (copy.length > 0) {
    const index = Math.floor(Math.random() * copy.length)
    result.push(copy[index])
    copy.splice(index, 1)
  }
  return result
}
