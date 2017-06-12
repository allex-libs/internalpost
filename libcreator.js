function createLib (execlib, leveldblib) {
  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib;

  return q({
    Mechanics: require('./mechanicscreator')(execlib, leveldblib)
  });
}

module.exports = createLib;
