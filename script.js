var request = require("request");
var parseString = require('xml2js').parseString;
var mysql = require('mysql');

// create a database name - hallmark
// create a table trigger_link with following fields
// id - primary
// trigger_word - varchar - 255
// link - text

var connection = mysql.createConnection({
  //socketPath : '/var/run/mysqld/mysqld.sock',
  host: '127.0.0.1',
  user: 'root',
  password: 'arun',
  database: 'ozbargain'
});

var url = 'https://www.ozbargain.com.au/classified/feed';
var trigger_array = ['pass', 'virgin'];
var non_trigger_array = ['arun'];

//----------------------------------
//----------------------------------
//----------------------------------

function logg(text){
  console.log(text)
}



function get_html( url, callback ){
  var options = {
    url: url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36'
    }
  };
  request(options, function (error, response, body) {
    if (!error) {
      callback('success',body);
    } else {
      callback('error',body)
    }
  });
}

function processItems( items, callback ){
  if( items.length == 0 ){
    callback()
  }else{
    var item = items[0];
    items.shift();
    processItem( item, function(){
      processItems( items, callback )
    })

  }
}

function processItem( item, callback ){
  var triggersFound = [];
  var nonTriggerFound = [];
  var fullString = item.title + ' ' + item.description;
  trigger_array.forEach(function(word){
    if(fullString.toLowerCase().indexOf(word.toLowerCase()) != -1){
      triggersFound.push(word)
    }
  })
  non_trigger_array.forEach(function(word){
    if(fullString.toLowerCase().indexOf(word.toLowerCase()) != -1){
      nonTriggerFound.push(word)
    }
  })
  logg( fullString )
  logg( 'triggersFound : ' + triggersFound )
  logg( 'nonTriggerFound : ' + nonTriggerFound )

  if( triggersFound.length == 0 ){
    logg('---No trigger found\n/\n')
    callback()
  }else{
    if( nonTriggerFound.length > 0 ){
      logg('---Trigger found 7 non-trigger also found\n\n')
      callback()
    }else{
      logg('---Trigger found & non-trigger not found, So will process further \n\n')
      checkInDB( triggersFound, item, function(){
        callback();
      })
    }
  }
}

function checkInDB( triggersFound, item, callback ){
  if( triggersFound.length == 0 ){
    callback()
  }else{
    var trigger_word = triggersFound[0];
    triggersFound.shift();
    var link = item.link;

    logg( 'trigger_word : ' + trigger_word )
    logg( 'link : ' + link )

    var searchQuery = `select * from trigger_link where trigger_word='`+trigger_word +`' AND link = '`+link +`'`;
    var insertQuery = `insert into trigger_link ( trigger_word, link) VALUES ('`+trigger_word+`','`+link+`')`;
    connection.query(searchQuery, function (err, results) {
      console.log(err)
      if(err){
        checkInDB( triggersFound, item, callback )
      }else{
        if(results.length > 0 ){
          logg('Result - Already Triggered')
          checkInDB( triggersFound, item, callback )
        }else{
          logg('Result - New Triggered')
          connection.query(insertQuery, function (err, results) {
            PM( item, function(){
              checkInDB( triggersFound, item, callback )
            })
          })
        }
      }
    });
  }
}

function PM( item, callback ){
  logg('PRIVATE MESSAGE IS CALLED');
  logg('*****************************')
  logg('*****************************')
  callback();
}

get_html(url,function( status, body){
  if( status == 'error'){
    op = {
      'status':0,
      'message' : 'Error occurs'
    };
  }else{
    parseString(body, {
      explicitArray : false
    }, function (err, result) {
      var items = result.rss.channel.item;
      processItems( items, function(){
        logg('All are done')
        process.exit();
      })
    });

  }
});