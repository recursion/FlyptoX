var Promise = require("bluebird");
var Order = require("../models/Order");
var accountManager = require('./accountManager.js');
var appEvents = require("../controllers/app-events");

// take an orderIntent
// return a promise of an orderIntent
module.exports = function(orderIntent){

  return new Promise(function(resolve, reject){
    // ask account manager to hold the funds
    // required for this orderIntent
    accountManager.processRequirements(orderIntent)

      // if account manager resolves the promise
      // it means the requirements have been met
      // and we can proceed with creating the orderIntent
      .then(function(){
        // create the orderIntent
        Order.forge({
          user_id: orderIntent.user_id,
          currency_pair_id: orderIntent.currency_pair_id,
          type: orderIntent.type,
          price: parseFloat(orderIntent.price),
          side: orderIntent.side,
          size: parseFloat(orderIntent.size)
        })
        .save()
        .then(function(order){
          if(!order) {
            console.log('WHY!!');
            // why would we get a resolved promise
            // if no orderIntent was created?
            var err = new Error('This might be the dumbest error in the world. TODO: Custom errors ftw');
            reject({error: err, message: 'orderIntent not accepted'});

          } else {
            order.load(['currency_pair']).then(function(order){

              // set status to open
              order.set('status', 'open');

              // create a json object
              var orderJSON = order.toJSON();

              // tell the world!
              appEvents.emit('order:new', orderJSON);

              // resolve our promise with the orderIntent id
              resolve({
                id: order.get('id'),
                user_id: order.get('user_id')
              });

            });
          }
        })
        .catch(function(err){
          console.error(err);
          // what would be best to send with rejection here?
          reject({error: err, message: 'orderIntent not accepted'});
        });
      })
      // accountManager rejects the orderIntent....
      .catch(function(err){
        // ermagherd! FAILCAKE!
        console.error(err);
        reject({error: err, message: 'Withholding requirements not met.'});
      });
  });
};
