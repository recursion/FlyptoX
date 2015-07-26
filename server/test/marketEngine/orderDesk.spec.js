var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var expect = chai.expect;
chai.use(chaiAsPromised);

var orderDesk = require('../../marketEngine/orderDesk.js');
var utils = require('../helpers.js');
var Account = require("../../models/Account");

describe('orderDesk', function(){
  var uid = null;

  before(function(done){

    var myUser = {
      password: 'angerdome',
      email: 'farnsworth@planetexpress.com',
      fullname: 'Professor Hubert J. Farnsworth'
    };
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
          return new Account({id: account.id}).fetch({withRelated: 'currency'})
        })
        .then(function(){
          //console.log(account.related('currency').get('currency'));
          //console.log(account.get('balance'));
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
            return new Account({id: account.id}).fetch({withRelated: 'currency'})
          })
          .then(function(){
            //console.log(JSON.stringify(account));
            //console.log(account.get('balance'));
            //console.log(account.related('currency').get('currency'));
            //console.log(account.get('balance'));
          })
        })
      })
      .catch(function(err){
        console.log(err);
      })
      .finally(done);
  });

  it('Returns a promised order containing the order id and the user id of the order', function(done){

    var myOrder = {
      sequence: 1,
      currency_pair_id: 1,
      type: 'limit',
      side: 'buy',
      price: 300.01,
      size: 5,
      filled_size: 5,
      user_id: uid
    };

    // send the order to order desk
    orderDesk(myOrder)
      .then(function(order){
        expect(order.user_id).to.equal(uid);
      })
      .catch(function(err){
        expect(err).to.equal(null);
      })
      .finally(done);
  });

});
