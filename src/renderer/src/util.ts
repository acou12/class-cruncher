export const fixedTime = (time: number): number => {
  return Math.floor(time / 100) * 60 + (time % 100)
}

export const randomColor = (): string =>
  Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')
