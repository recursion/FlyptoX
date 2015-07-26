// object for calculating the requirements of an order
//

var bookshelf = require('../utils/bookshelf');
var Promise = require("bluebird");

// constructor
var Requirements = function(orderRequest){
  this.orderRequest = orderRequest;
  this.account = null;
  this.amount = 0;
  // required percentage of equity to place a trade
  this.margin = 100;
};

// set the amount required to be withheld for this trade
Requirements.prototype.setAmount = function(){
  if (this.orderRequest.side === 'buy'){
    this.calculateBuyWithholding();
  } else {
    this.calculateSellWithholding();
  }
};

// set the account the requirements will apply to
// return a promise that includes the correct account to use
// or the error
Requirements.prototype.setAccount = function(){
  var self = this;

  return new Promise(function(resolve, reject){

    // pull up the info about this orders currency pair
    bookshelf.model('CurrencyPair').forge({id: self.orderRequest.currency_pair_id})

      // we need to know base and quote currency of hte ' +pair
      .fetch({withRelated: ['base_currency', 'quote_currency']})

      .then(function(pair){

        // keep track of the currency id we need for this requirement
        var currencyId = null;

        // require quote currency for buys
        if (self.orderRequest.side === 'buy'){

          currencyId = pair.related('quote_currency').get('id');

        // and hold base currency for sells
        } else if (self.orderRequest.side === 'sell') {

          currencyId = pair.related('base_currency').get('id');

        } else {

          console.error('Incorrect value: ' + self.orderRequest.side + '! Must be string equal to buy or sell');

          throw new Error('Something exploded while calculating requirements');

        }

        return bookshelf.model('Account')
          .forge({user_id: self.orderRequest.user_id})
          .where({currency_id: currencyId})
          .fetch()

      })

      .then(function(account){
        // TODO: fix the error occuring here during tests
        // An error is occuring here during testing wher
        // we get resolved here, but do not have an account
        if (!account){
          reject({
            error: new Error('Error while retrieving account!'),
            message: 'Unable to retrieve account data.'
          });
        }

        self.account = account.id
        resolve();
      })
      .catch(function(err){
        reject({error: err, message: 'Invalid account?'});
      });
  });
};

// calculate withholding requirements for a buy order
Requirements.prototype.calculateBuyWithholding = function() {
  // buy order
  // Base Currency vs. Quote Currency
  // buy orderRequest of XBT/USD = hold USD
  //
  //     orderRequest.price in currency_pair.quote_currency
  //   * orderRequest.size
  //   * withHoldingRequirement
  //   ------------------------
  //   = withHoldAmount

  //TODO Add margin calculations
  this.amount = this.orderRequest.price * this.orderRequest.size;
};

// calculate withholding requirements for a sell order
Requirements.prototype.calculateSellWithholding = function() {

  // sell order
  // sell orderRequest of XBT/USD = withhold XBT
  //TODO Add margin calculations
  this.amount = this.orderRequest.size;
};

Requirements.prototype.calculate = function() {
  var self = this;

  return new Promise(function(resolve, reject){

    // set the account we are setting the requirements on
    self.setAccount()
      .then(function(){

        // market orders:
          // matching engine will exhaust the trade once
          // funds are no longer available

        if (self.orderRequest.type === 'limit'){

          // calculate withholding based on order side (buy/sell)
          // assume we always get a correct side
          self.setAmount();

          // check available balance vs. requirements

            // TODO: actually check balance vs. requirements here

            // if requirements.amount < requirements.account.balance + fees

            if (1) {
              // resolve
              resolve({
                amount: self.amount,
                account: self.account,
                // margin: this.margin,
                order: self.orderRequest
              });
            } else {
              // otherwise reject with reason
              reject({message: 'Insufficient Funds'});
            }

        } else {
          // TODO: what else should we do here?
          resolve({message: 'Market Order'});
        }
      })
      .catch(function(err){
        reject(err);
      });

    });
};
module.exports = Requirements;
