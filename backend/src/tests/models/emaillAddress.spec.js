import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import EmailAddressModel, {
  createEmailAddress,
  getEmailsByUser,
} from '../../models/emailAddress';

import User from '../../models/user';
import db from '../../database';

chai.use(chaiAsPromised);

describe('EmailAddressModel', () => {
  beforeEach(async () => {
    await db.sync({ force: true });
  });

  describe('emailAddress creation test', () => {
    let user = null;
    beforeEach(async () => {
      user = await User.create({
        key: 'userKey',
      });
    });
    afterEach(async () => {
      await User.truncate();
    });
    it('should not create email address for wrong arguments', async () => {
      try {
        await createEmailAddress({
          invalid: 'param1',
          wrong: 'param2',
        });
      } catch (e) {
        expect(e.message).to.equal('Invalid param error');
      }
    });

    it('should not create email for malformed email address', async () => {
      try {
        await createEmailAddress({
          email: 'wrongEmail',
          userKey: user.key,
        });
      } catch (e) {
        expect(e.message).to.equal('Invalid param error');
      }
    });

    it('should create an email address', async () => {
      const email = await createEmailAddress({
        email: 'user@example.com',
        userKey: user.key,
      });
      expect(email.address).to.equal('user@example.com');
    });

    it('should not create an email address', async () => {
      await EmailAddressModel.create({
        address: 'userUnique@example.com',
      });
      await expect(createEmailAddress({
        email: 'userUnique@example.com',
        userKey: user.key,
      })).to.be.rejectedWith(Error, 'DB Error');
    });
  });

  describe('getEmailsByUser test', () => {
    let user = null;
    beforeEach(async () => {
      user = await User.create({
        key: 'userKey',
      });

      const email = await EmailAddressModel.create({
        address: 'user@example.com',
      });
      await user.setEmails(email);
    });
    afterEach(async () => {
      await User.truncate();
    });

    it('should throw error for malformed user input', async () => {
      try {
        await getEmailsByUser();
      } catch (e) {
        expect(e).to.be.a('Error');
      }

      try {
        await getEmailsByUser({});
      } catch (e) {
        expect(e.message).to.be.equal('invalid user');
      }
    });

    it('should get empty array for wrong createdAt', async () => {
      const user2 = await User.create({
        key: 'userKey2',
      });

      const emailAddresses = await getEmailsByUser({ userKey: user2.key });
      // eslint-disable-next-line no-unused-expressions
      expect(emailAddresses).to.be.an('array').that.is.empty;
    });

    context('emailAddress present for user', () => {
      it('should get array of EmailAddress for correct userKey', async () => {
        const emailAddresses = await getEmailsByUser({ userKey: user.key });
        // eslint-disable-next-line no-unused-expressions
        expect(emailAddresses).to.be.an('array');
        expect(emailAddresses[0].address).equals('user@example.com');
      });
    });
  });
});
