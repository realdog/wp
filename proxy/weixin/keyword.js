var _query = function(connection, sql, obj, callback){

    if (!!connection) {
        connection.query(sql, obj, function(err, results){
            callback(err, results);
        });
    }   else {
        resource.pool.getConnection(function(err, connection) {
            if (!!err) {
                return callback(err);
            } else {
                connection.query(sql, obj, function(err, results){
                    connection.end();
                    callback(err, results);
                });
            }
        });
    }
};

var _checkKeyWord = function(config, )