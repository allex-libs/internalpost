function initInternalPost(execlib) {
  var libCreator = require('./libcreator').bind(null, execlib);
  return execlib.loadDependencies('client', ['allex:leveldb:lib'], libCreator);
}

module.exports = initInternalPost;
