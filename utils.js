export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function getRandomBoolean() {
  return Math.random() <= 0.5;
}
