// accountManager
// withhold / clear accounts

var Promise = require("bluebird");

// use this object to create new requirement objects
// the constructor must be passed an orderIntent object
// new Requirements(orderIntent);
var Requirements = require('./requirements.js');

var bookshelf = require('../utils/bookshelf');

// our export object
var accountManager = module.exports;
//  calculate withholding requirements

// main export function
// takes an orderRequest and returns a promise
// the promise is resolved if
accountManager.processRequirements = function(orderRequest){

  // return a promise which will confirm or reject the orderRequest
  // based on funds being withholdable
  return new Promise(function(resolve, reject){

    // this users accounts
    var accounts;

    // get user (specifically user accounts) from orderRequest
    // this query is whacked im sure.. but this is the idea
    bookshelf.model('User').forge({id: orderRequest.user_id}).fetch({withRelated: 'accounts'})
      .then(function(user){
        // locate the users account

        accounts = user.related('accounts');
        //console.log(accounts);

        // calculate withholding requirements of this order
        // returns an object with the account(id) and requirements to withhold
        // {account: <account_id>, requirements: <amountToWithHold>}
        var reqs = new Requirements(orderRequest);
        reqs.calculate()
          // requirements object:
          // {
          //   amount: (someNumber),
          //   account: (uuid),
          //   order: (the orderRequest info)
          // }
          .then(function(requirements){
            // determine if requirements can be met

            // if requirements.amount <
            // for now we are just resolving no matter what
            resolve(requirements);

            // if the hold gets rejected
              // reject the order with reason from hold rejection

           // else reject();

          })
          .catch(function(err){
            console.error(err);
            reject(err);
          });

      })
    // error finding user - reject orderRequest
      .catch(function(err){
        console.log(err);
        reject(err);
      });

      });
};
