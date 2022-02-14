module.exports = (max, min) => {
  min = min ?? 0;
  return Math.floor(Math.random() * (max - min)) + min;
};
