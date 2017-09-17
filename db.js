var mysql = require('mysql');


var connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'arun',
  multipleStatements: true
});

var checkDB = `SHOW DATABASES LIKE 'ozbargain'`;

var q = 'CREATE DATABASE ozbargain; use ozbargain; CREATE TABLE trigger_link (id int NOT NULL AUTO_INCREMENT, trigger_word varchar(255), link text, PRIMARY KEY (id) ); ';

connection.query(checkDB, function (err, results) {
  console.log(err)
  if(err){

  }else{
    if(results.length > 0 ){
      console.log('db already exists')
      process.exit();
    }else{
    	connection.query(q, function (err, results) {
			  if(err){
			    console.log(err)
			    process.exit();
			  }else{
			  	console.log('db created!!!')
			  	process.exit();
			  }
			});
    }
  }
});


//trigger_link

//id
//trigger_word
//link