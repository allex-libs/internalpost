function createLib (execlib, leveldblib) {
  return q({
    Mechanics: require('./mechanicscreator')(execlib, leveldblib)
  });
}

module.exports = createLib;
