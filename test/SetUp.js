// This is an example test file. Hardhat will run every *.js file in `test/`,
// so feel free to add new ones.

// Hardhat tests are normally written with Mocha and Chai.

// We import Chai to use its asserting functions here.
const {expect} = require('chai');

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage of Hardhat Network's snapshot functionality.
const {loadFixture} = require('@nomicfoundation/hardhat-network-helpers');
const util = require('ethereumjs-util');
// const {zeroAddress} = require('ethereumjs-util');
// const { ethers } = require("ethers");

// `describe` is a Mocha function that allows you to organize your tests.
// Having your tests organized makes debugging them easier. All Mocha
// functions are available in the global scope.
//
// `describe` receives the name of a section of your test suite, and a
// callback. The callback must define the tests of that section. This callback
// can't be an async function.
describe('Set Up contract', function () {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployTokenFixture() {
    // Get the ContractFactory and Signers here.
    const SetUpContract = await ethers.getContractFactory('SetUp');
    const [owner, other, onlyMasterAddressA , onlyMasterAddressB ] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // its deployed() method, which happens once its transaction has been
    // mined.
    const hardhatContract = await SetUpContract.deploy();

    await hardhatContract.deployed();

    // Fixtures can return anything you consider useful for your tests
    return {SetUpContract, hardhatContract, owner, other, onlyMasterAddressA, onlyMasterAddressB };
  }

  // You can nest describe calls to create subsections.
  describe('Set up Contract test', function () {
    it('(1) 0x0/msg sender as the onlymaster, and being able to add and modify hashes', async function () {
      const {hardhatContract, owner, other} = await loadFixture(
        deployTokenFixture,
      );
      console.log('****(1)test start---****');
      console.log('--set msg.sender as master address by passing zero address');
      await hardhatContract.setMasters(ethers.constants.AddressZero);
      console.log('--set value from msg.sender address');
      await hardhatContract.setPubKey(owner.address, [util.fromAscii('first')]);
      const first = await hardhatContract.getPubKey(owner.address);
      console.log('--change value from msg.sender address');
      await hardhatContract.setPubKey(owner.address, [
        util.fromAscii('second'),
      ]);
      const second = await hardhatContract.getPubKey(owner.address);
      console.log(
        'first value => ',
        util.toAscii(first[0]),
        '|| second value =>',
        util.toAscii(second[0]),
      );
      console.log('****test end****');
    });

    it('(2) user setting onlyMaster address in the setMaster() and then trying to change the hashes, then it shows Data is set already and sender is not master and can change with master address', async function () {
      const {hardhatContract, owner, other} = await loadFixture(
        deployTokenFixture,
      );
      console.log('****(2)test start****');
      console.log('--set master address as other address');
      await hardhatContract.setMasters(other.address);
      console.log(
        '--then try to set the data with msg sender for the first time. this should work.',
      );
      await hardhatContract.setPubKey(owner.address, [util.fromAscii('first')]);
      const first = await hardhatContract.getPubKey(owner.address);
      try {
        console.log(
          '--again try to change value. this should not work because msg sender is not master address',
        );
        await hardhatContract.setPubKey(owner.address, [
          util.fromAscii('second'),
        ]);
      } catch (e) {
        console.log('--error =>', util.toAscii(e.data));
      }
      const second = await hardhatContract.getPubKey(owner.address);
      console.log('--then change account to other(master) address and try to change value. this should work');
      await hardhatContract.connect(other).setPubKey(owner.address, [
        util.fromAscii('third'),
      ]);
      const third = await hardhatContract.getPubKey(owner.address);
      console.log(
        '--first value => ',
        util.toAscii(first[0]),
        '|| second value =>',
        util.toAscii(second[0]),
        '|| third value =>',
        util.toAscii(third[0]),
      );
      console.log('****test end****');
    });

    it("(3)  2 separate users interacting with the setup contract and setting 2 different only master addresses. UserA sets onlyMasterAddressA and UserB sets onlyMasterAddressB. Then try onlyMasterAddressB trying to change userA hash, and onlyMasterAddressA trying to change userB hash. Both should show 'Data is set already and sender is not master'", async function () {
      const {hardhatContract, owner, other, onlyMasterAddressA, onlyMasterAddressB } = await loadFixture(
        deployTokenFixture,
      );
      console.log('****(3)test start---****');
      // owner is user A other is user B
      console.log('--user A(owner) set master address A => ', onlyMasterAddressA.address);
      await hardhatContract.setMasters(onlyMasterAddressA.address);
      await hardhatContract.setPubKey(owner.address, [util.fromAscii('Init User A data')]);
      console.log('--user B(other) set master address B =>',onlyMasterAddressB.address);
      await hardhatContract.connect(other).setMasters(onlyMasterAddressB.address);
      await hardhatContract.connect(other).setPubKey(other.address, [util.fromAscii('Init User B data')]);
      try {
        console.log('--try to change value of user A from onlyMasterAddressB, this should show error',);
        await hardhatContract.connect(onlyMasterAddressB).setPubKey(owner.address, [util.fromAscii('update User A data')]);
      } catch (e) {
        console.log('--error =>', util.toAscii(e.data));
      }
      try {
        console.log('--try to change value of user B from onlyMasterAddressA, this should show error',);
        await hardhatContract.connect(onlyMasterAddressA).setPubKey(other.address, [util.fromAscii('update User B data')]);
      } catch (e) {
        console.log('--error =>', util.toAscii(e.data));
      }
      const userAData = await hardhatContract.getPubKey(owner.address);
      const userBData = await hardhatContract.getPubKey(other.address);
      console.log(
        '--User A value => ',
        util.toAscii(userAData[0]),
        '|| User B value =>',
        util.toAscii(userBData[0]),
      );
      console.log('****test end****');
    });

    it("(4) it is my own test. if user A data is not set yet, and trying to set user A value from other address that is not master address. this should show error", async function () {
      const {hardhatContract, owner, other } = await loadFixture(
        deployTokenFixture,
      );
      console.log('****(4)test start****');
      try {
        await hardhatContract.connect(other).setPubKey(owner.address, [util.fromAscii('init User A data')]);
      } catch (e) {
        console.log('--error =>', util.toAscii(e.data));
      }
      const userAData = await hardhatContract.getPubKey(owner.address);
      console.log(
        '--User A value => ',
        userAData,
      );
      console.log('****test end****');
    });
  });
});
