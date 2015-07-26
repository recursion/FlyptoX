// accountManager
// withhold / clear accounts

var bookshelf = require('../utils/bookshelf');
var Promise = require("bluebird");
var User = require("../models/User");
var Account = require("../models/Account");

// our export object
var accountManager = module.exports;

// account helper functions??
// exported for testing
var hold = accountManager.hold = function(account, orderInfo){
  // move funds from available to hold
  return new Promise(function(resolve, reject){
    // if we were able to withhold the funds
    if (1){
      resolve();
    // otherwise reject
    } else {
      reject();
    }
  });
};

var clear = accountManager.clear = function(account, orderInfo){
  // release from hold back to available
};

var transfer = accountManager.transfer = function(account1, account2){
  // move funds from 1 account to another
};

// object map for calculating withholding requirements
var calculateRequirements = accountManager.calculateRequirements = function(orderRequest){

    bookshelf.model('CurrencyPair').forge({id: orderRequest.currency_pair_id})
      .fetch({withRelated: ['base_currency', 'quote_currency']})
      .then(function(pair){
        console.log('---->', pair.related('base_currency'));
        //console.log('---->', pair.related('quote_currency'));
        //console.log('---->', pair);
      })
      .catch(function(err){
        console.log(err);
      });


    // if market order
      // -> hold all funds until order is resolved!

    // determine account to place the hold against
      // currency should be 1 since we need to withhold dollars


    var account = 1; // SHOULD NOT BE SET TO 1

    //console.log('Calculating buy requirements for: ', orderRequest);
    return new Promise(function(resolve, reject){
      // use currency pair and order.side to determine account to use

      // calculate withholding

      // buy order
      // Base Currency vs. Quote Currency
      // buy orderRequest of XBT/USD = hold USD
      //
      //     orderRequest.price in currency_pair.quote_currency
      //   * orderRequest.size
      //   * withHoldingRequirement
      //   ------------------------
      //   = withHoldAmount

      // sell order
      // sell orderRequest of XBT/USD = withhold XBT

      //     orderRequest.size from account of currency_pair_id type
      //   * withHoldingRequirement
      //   ---------------------
      //   = holdAmount


      // hardcoded until calcs above are implemented
      var amountToWithHold = 500;
      resolve({account: account, requirements: amountToWithHold});

      // fake reject condition
      if(1 === 2){
        reject();
      }
    });
};

// main export function
// takes an orderRequest and returns a promise
accountManager.withhold = function(orderRequest){

    // return a promise which will confirm or reject the orderRequest
    // based on funds being withholdable
    return new Promise(function(resolve, reject){

      // this users accounts
      var accounts;

      // get user (specifically user accounts) from orderRequest
      // this query is whacked im sure.. but this is the idea
      new User({id: orderRequest.user_id}).fetch({withRelated: 'accounts'})
        .then(function(user){
          // locate the users account

          accounts = user.related('accounts');
          //console.log(accounts);

          // calculate withholding requirements of this order
          // returns an object with the account(id) and requirements to withhold
          // {account: <account_id>, requirements: <amountToWithHold>}
          calculateRequirements(orderRequest)

            .then(function(requirements){
              // in the account in play for this transaction
              // move withholdAmount to holding account
              // or however holds are implemented

              //TODO: implement the following psuedo
              //hold(account, requirements);
                // if successful
                  // resolve();

                  // for now we are just resolving no matter what
                  // with the req. object that we get back from the method
                  resolve(requirements);

                // if the hold gets rejected
                  // reject the order with reason from hold rejection

             // if there was an error
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
