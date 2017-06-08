function createMechanics(execlib, leveldblib) {
  'use strict';

  var lib = execlib.lib;
  var q = lib.q;
  var qlib = lib.qlib;

  function Mechanics(dbname, defer){
    this.dbDefer = q.defer();
    if (defer) {
      qlib.promise2defer(this.dbDefer.promise, defer);
    }
    this.dbDefer.promise.then(this.onDBCreated.bind(this));
    this.db = null;
    new (leveldblib.LevelDBHandler)({
      dbname: dbname,
      starteddefer: this.dbDefer,
      initiallyemptydb: false,
      dbcreationoptions: {
        keyEncoding: 'string',
        valueEncoding: 'json'
      }
    });
  }

  Mechanics.prototype.destroy = function(){
  }

  Mechanics.prototype.onDBCreated = function (db) {
    this.db = db;
  };

  Mechanics.prototype.createLinkURL = function(baseURL,paramObj){
    return this.dbDefer.promise
      .then(this.linkURLcreator.bind(this,baseURL,paramObj));
  }

  Mechanics.prototype.createKey = function(){
    return lib.uid();
  };

  function onPut(baseURL,key){
    return q(baseURL + '?id=' + key);
  }

  Mechanics.prototype.linkURLcreator = function (baseURL,paramObj) {
    paramObj = paramObj || {};
    var key = this.createKey();
    return this.db.put(key,paramObj).then(
      onPut.bind(null,baseURL,key)
    );
  };

  Mechanics.prototype.get = function(postid){
    return this.dbDefer.promise.then(this.getter.bind(this, postid));
  };

  Mechanics.prototype.getter = function (postid) {
    var ret = this.db.safeGet(postid,null);
    return ret; 
  };

  return Mechanics;

}


module.exports = createMechanics;
