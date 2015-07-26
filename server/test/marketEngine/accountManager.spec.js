var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var expect = chai.expect;

var utils = require('../helpers.js');
var accountManager = require('../../marketEngine/accountManager.js');

var User = require("../../models/User");
var Account = require("../../models/Account");

chai.use(chaiAsPromised);

describe('accountManager', function(){

  var uid = null;

  // account ids
  var usd = null;
  var btc = null;

  before(function(done){
    var myUser = {
      password: 'floydsRflamingosToo',
      email: 'roger@waters.com',
      fullname: 'Rogery Waters'
    };

    // create a user to test with
    utils.user.createCustom(myUser)
      .then(function(user){

        // create a new usd wallet for this user
        uid = user.get('id');
        Account.forge({
          user_id: uid,
          balance: 100000,
          currency_id: 1,
          available: 10000
        })
        .save()
        .then(function(account){
          usd = account.get('id');
          return;
        })
        .then(function(){
          // create a new BTC Wallet for this user
          Account.forge({
            user_id: uid,
            balance: 100,
            currency_id: 2,
            available: 100
          })
          .save()
          .then(function(account){
            btc = account.get('id');
            done();
          })
        })
      })
      .catch(function(err){
        console.error(err);
        done();
      });
  });

  describe('#processOrder', function(){
    // use these for test that need them
    // user id
    it('returns a promise of an order\'s requirements', function(done){

      var myOrder = {
        sequence: 1,
        currency_pair_id: 1,
        type: 'limit',
        side: 'sell',
        price: 350.00,
        size: 5,
        filled_size: 5,
        user_id: uid
      };

      accountManager.processRequirements(myOrder)
        .then(function(requirements){
          // btc is the id of our users btc account
          expect(requirements).to.have.property('account');
        })
        .catch(function(err){
          console.log('WTF->', err);
          expect(err).to.equal(null);
        })
        .finally(done);
    });

    it('returns the correct account to withhold against in a sell order', function(done){

      var myOrder = {
        sequence: 1,
        currency_pair_id: 1,
        type: 'limit',
        side: 'sell',
        price: 350.00,
        size: 5,
        user_id: uid
      };

      accountManager.processRequirements(myOrder)
        .then(function(requirements){
          // btc is the id of our users btc account
          expect(requirements.account).to.equal(btc);
        })
        .catch(function(err){
          console.log('FRD->', err);
          expect(err).to.equal(null);
        })
        .finally(done);
    });

    it('returns the correct acocunt to withold against in a buy order', function(done){
      var myOrder = {
        sequence: 1,
        currency_pair_id: 1,
        type: 'limit',
        side: 'buy',
        price: 300.00,
        size: 50,
        user_id: uid
      };

      accountManager.processRequirements(myOrder)
        .then(function(requirements){
          // btc is the id of our users btc account
          expect(requirements.account).to.equal(usd);
        })
        .catch(function(err){
          expect(err).to.equal(null);
        })
        .finally(done);

    });

    xit('determines the correct amount of quote currency to hold in a buy', function(){
      var user_id = 1;
      new Account.forge({
        user_id: user_id,
        currency_id: 1,
        balance: 10000,
        available: 10000
      })
      .save()
      .then(function(){
        return new User({id: user_id}).fetch({withRelated: ['accounts']});
      })
      .then(function(){
      })
      .catch(function(err){
        console.log(err);
      });
    });
  });
});
