var MongoClient = require('mongodb').MongoClient;
var url = "";

MongoClient.connect(url, function(err, db){

    if(err){
        throw err;
    }
    console.log("testDB is created!");

    db.createCollection("user", function(err, res){
        if(err) throw err;
        console.log("user collection created!");
        db.close();
    });

    db.collection("user").insertMany(inputWiki, function(err, res){
        if(err) throw err;
        console.log("Num docs created: " + res.insertedCount);
        db.close();
    });

    var mysort = {name: 1};
    db.collection("user").find().sort(mysort).toArray(function(err, result){
        if(err) throw err;
        console.log(result);
        db.close();
    });

    db.collection("user").updateOne(keyQuery, newValues, function(err, res){
        if(err) throw err;

        console.log("1 document updated");
        db.close();
    });

    db.collection("user").deleteOne(keyQuery, function(err, obj){
        if(err) throw err;

        console.log("1 document deleted");
        db.close();
    });

    db.collection("user").drop(function, (err, delOK){
        if(err) throw err;
        
        if(delOK){
            console.log("Collection deleted");
        }
        db.close();
    });
});