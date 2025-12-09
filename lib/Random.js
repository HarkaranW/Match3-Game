export const getRandomNumber = (min, max) => (Math.random() * (max - min) + min) * (Math.random() < 0.5 ? -1 : 1);

export const getRandomPositiveNumber = (min, max) => (Math.random() * (max - min) + min);

export const getRandomNegativeNumber = (min, max) => (Math.random() * (max - min) + min) * -1;

export const getRandomPositiveInteger = (min, max) => Math.floor((Math.random() * (max - min + 1))) + min;

export const pickRandomElement = (list) => list[getRandomPositiveInteger(0, list.length - 1)];
