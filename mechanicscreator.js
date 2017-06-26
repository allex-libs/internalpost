function createMechanics(execlib, leveldblib) {
  'use strict';

  var lib = execlib.lib;
  var q = lib.q;
  var qlib = lib.qlib;
  var crypto = require('crypto');

  function createHashFromString(string){
    var md5sum = crypto.createHash('md5');
    return crypto.createHash('md5').update(string).digest('hex');
  }

  function Mechanics(dbname, defer){
    this.urlLifetime = 1000*60*60*24*10; //10 days
    this.workFrequency = 1000*60*60*3; //3 hours
    this.keysForDelete = [];
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
    this.keysForDelete = null;
    this.workFrequency = null;
    this.urlLifetime = null;
  }

  Mechanics.prototype.doCronJob = function(){
    this.cronJob();
    setTimeout(this.doCronJob.bind(this),this.workFrequency);
  };

  Mechanics.prototype.addToKeysForDeleteIfOld = function(kv){
    var key = kv.key;
    var value = kv.value;
    if (!key) return;
    if (!value) return;
    var timestamp = value.timestamp;
    var data = value.data;
    var now = new Date();
    var nowTime = now.getTime();
    if (nowTime - timestamp > this.urlLifetime){
      this.keysForDelete.push(key);
    }
  };

  Mechanics.prototype.clearKeysForDelete = function(){
    this.keysForDelete = [];
  };

  Mechanics.prototype.deleteEntry = function(promiseArry,key){
    var defer = q.defer();
    promiseArry.push(defer.promise);
    this.db.del(key).then(
      defer.resolve.bind(defer)
    );
  };

  Mechanics.prototype.doDelete = function(){
    var promiseArry = [];
    this.keysForDelete.forEach(this.deleteEntry.bind(this,promiseArry));
    q.all(promiseArry).then(
      this.clearKeysForDelete.bind(this)
    );
  };

  Mechanics.prototype.cronJob = function(){
    this.db.traverse(this.addToKeysForDeleteIfOld.bind(this)).then(
      this.doDelete.bind(this)
    );
  };

  Mechanics.prototype.onDBCreated = function (db) {
    this.db = db;
    this.doCronJob();
  };

  Mechanics.prototype.createLinkURL = function(baseURL,paramObj){
    return this.dbDefer.promise
      .then(this.checkIfURLexists.bind(this,paramObj))
      .then(this.linkURLcreator.bind(this,baseURL,paramObj));
  }

  Mechanics.prototype.createKey = function(paramObj){
    if (!paramObj || !paramObj.url) return lib.uid();
    return createHashFromString(paramObj.url);
  };

  function onPut(baseURL,key){
    return q(baseURL + '?id=' + key);
  }

  Mechanics.prototype.linkURLcreator = function (baseURL,paramObj,currentItem) {
    paramObj = paramObj || {};
    var key = this.createKey(paramObj);
    return this.db.put(key,{
      data : paramObj,
      timestamp : Date.now()
    }).then(
      onPut.bind(null,baseURL,key)
    );
  };

  Mechanics.prototype.checkIfURLexists = function(paramObj){
    return this.dbDefer.promise.then(this.urlChecker.bind(this, paramObj));
  };

  Mechanics.prototype.urlChecker = function (paramObj) {
    if (!paramObj) return q(null);
    return this.db.safeGet(paramObj.url,null);
  };

  Mechanics.prototype.get = function(postid){
    var defer = q.defer();
    this.dbDefer.promise.then(this.getter.bind(this, defer, postid));
    return defer.promise;
  };

  Mechanics.prototype.onGetFinished = function(defer,result){
    if (!!result){
      result = result.data;
    }
    defer.resolve(result);
  };

  Mechanics.prototype.getter = function (defer,postid) {
    this.db.safeGet(postid,null).then(
      this.onGetFinished.bind(this,defer)
    );
  };

  return Mechanics;

}


module.exports = createMechanics;
