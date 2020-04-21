let MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost/userdb";  //   Using default port
let mongoConnectOptions = { //  Prevent "Server Discovery and Monitoring engine is deprecated..." error
    useNewUrlParser: true,
    useUnifiedTopology: true
  };


  MongoClient.connect(url, mongoConnectOptions, function(err, db) {
    if (err) {
        throw err;
    }
    let dbo = db.db("total_sports");
    
    
  
    let inputCustomers = [
      { name: 'Nate', address: '123 Main Street'},
      { name: 'James', address: '1834 South Charles'},
      { name: 'Tupac', address: '222 Thugs Mansion Drive'},
      { name: 'Fred', address: '5 Cavan Green Circle'},
      { name: 'Cassie', address: '56 Riverside Avenue'}
    ];

    let nameSort = {name: 1};

    let keyQuery = {name: "Cassie"};
    let newValues = {$set: {address: "1244 William Street"}};



    /* Note to self: customers and immortal are test collections; they can be deleted after relevant collections are working
    dbo.collection("customers").insertMany(inputCustomers, function(err, res) {
        if (err) {
            throw err;
        }
        console.log("Number of documents inserted: " + res.insertedCount);
        db.close();
      });

      dbo.collection("immortal").insertMany(inputCustomers, function(err, res) {
        if (err) {
            throw err;
        }
        console.log("Number of documents inserted: " + res.insertedCount);
        db.close();
      });
      //
       End note to self
       */

/*
    dbo.collection("customers").drop(function(err, delOK) {
      if (err) {
        throw err;
      }
      if(delOK) {      
        console.log("Collection Deleted!");
      }
      db.close();
    });
*/

    console.log(dbo.collection('users'));
    
    dbo.collection('users').insertOne({name:'Robin Hood', username:'robinofloxley',password:'Rise, and Rise Again'}, function(err,res){
        if(err){
            throw err;
        }
        console.log(`We inserted ${res.insertedCount} document(s)`);
        db.close();
    });



  });