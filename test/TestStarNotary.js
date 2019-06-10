const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary' , (accs) => {
   accounts = accs;
   owner = accounts[0];
});

it('can Create a Star', async () => {
  let tokenId = 1;
  let instance = await StarNotary.deployed();
  await instance.createStar("Awesome Star", tokenId, {from: accounts[0]});
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star');
});

it('lets user1 put their star up for sale', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar("Awesome Star", starId, {from: user1});
  await instance.putStarUpForSale(starId, starPrice, {from: user1});
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("Awesome Star", starId, {from: user1});
  await instance.putStarUpForSale(starId, starPrice, {from: user1});
  let user1BalanceBeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, {from: user2, value: balance});
  let user1BalanceAfterTransaction = await web3.eth.getBalance(user1);
  let balanceShouldBe = Number(user1BalanceBeforeTransaction) + Number(starPrice);
  let balanceIs = Number(user1BalanceAfterTransaction);
  assert.equal(balanceShouldBe, balanceIs);
});

it('lets user2 buy a star if it is up for sale and own it', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("Awesome Star", starId, {from: user1});
  await instance.putStarUpForSale(starId, starPrice, {from: user1});
  await instance.buyStar(starId, {from: user2, value: balance});
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("Awesome Star", starId, {from: user1});
  await instance.putStarUpForSale(starId, starPrice, {from: user1});
  let user2BalanceBefore = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
  let user2BalanceAfter = await web3.eth.getBalance(user2);
  let pricePaid = Number(user2BalanceBefore) - Number(user2BalanceAfter);
  assert.equal(pricePaid, starPrice);
});