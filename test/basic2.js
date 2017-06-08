function onCreatedURL(ipm,url){
  console.log('EVO URL-A HEJ',url);
  var key = url.split('=')[1];
  console.log('.. AJDE I KEY',key);
  ipm.get(key).then(
    console.log.bind(console,'----REZULTAT GETA')
  );
}

function onInternalPost(intertnalPostLib){
  console.log('DAJ ARGUMENTS',arguments);
  internalPostMechanics = new intertnalPostLib.Mechanics('internalpost.db');
  internalPostMechanics.createLinkURL('https://blaze.im').then(
    onCreatedURL.bind(null,internalPostMechanics)
  )
}

describe('Basic tests', function () {
  var intertnalPost = require('../index.js')(execlib);
  intertnalPost.then(
    onInternalPost
  );
  /*
  loadClientSide(['allex:directory:lib']);
  it ('Create a directory database', function () {
    return setGlobal('DB', new directorylib.DataBase('test.dir'));
  });
  */
});
