function initInternalPost(execlib) {
  var libCreator = require('./libcreator').bind(null, execlib);
  return execlib.loadDependencies('client', ['allex_leveldblib'], libCreator);
}

module.exports = initInternalPost;
