import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import EmailContentModel, {
  createEmailContent,
  getEmailContentList,
  getEmailContent,
} from '../../models/emailContent';

import config from '../../config';
import EmailAddressModel from '../../models/emailAddress';
import User from '../../models/user';
import db from '../../database';

chai.use(chaiAsPromised);


describe('EmailContent', () => {
  let user = null;
  before(async () => {
    // await EmailContentModel.sync({ force: true });
    // await EmailAddressModel.sync({ force: true });
    // await User.sync({ force: true });
    await db.sync({ force: true });
    user = await User.create({
      key: 'userKey',
    });
    const email = await EmailAddressModel.create({
      address: `user@${config.allowedDomain}`,
    });
    await user.setEmails(email);
  });

  describe('emailContent creation test', () => {
    it('should not create emailContent for no args', async () => {
      try {
        await createEmailContent({});
      } catch (e) {
        return expect(e.message).to.equal('Invalid param error');
      }
      throw new Error('test should not reach here');
    });

    it('should not create emailContent for missing envelope', async () => {
      try {
        await createEmailContent({
          subject: 'test',
          htmlBody: '<p></p>',
          spamReport: 'report',
          senderIp: '1.1.1.1',
        });
      } catch (e) {
        return expect(e.message).to.equal('Invalid param error');
      }
      throw new Error('test should not reach here');
    });

    it('should not create emailContent for unknown recipient', async () => {
      try {
        await createEmailContent({
          envelope: '{"to":["example@example.comom"],"from":"example@example.com"}',
          subject: 'test',
          htmlBody: '<p></p>',
          spamReport: 'report',
          senderIp: '1.1.1.1',
        });
      } catch (e) {
        return expect(e.message).to.equal('No allowed recipient found');
      }
      throw new Error('test should not reach here');
    });

    it('should not create emailContent for unavailable email', async () => {

      try {
        await createEmailContent({
          envelope: `{"to":["example@${config.allowedDomain}", "example2@${config.allowedDomain}"],"from":"example@example.com"}`,
          subject: 'test',
          htmlBody: '<p></p>',
          spamReport: 'report',
          senderIp: '1.1.1.1',
        });
      } catch (e) {
        expect(e.message).to.equal('recipient not found in database');
        return;
      }

      throw new Error('Test should not react here');
    });

    it('should create emailContent for correct arguments', async () => {
      const created = await createEmailContent({
        envelope: `{"to":["user@${config.allowedDomain}", "user@example.com"],"from":"example@example.com"}`,
        subject: 'test',
        htmlBody: '<p></p>',
        spamReport: 'report',
        senderIp: '1.1.1.1',
      });

      expect(created).to.have.a.property('id');
    });

    it('should throw error for wrong email, user combination', async () => {
      await createEmailContent({
        envelope: `{"to":["user@${config.allowedDomain}", "user@example.com"],"from":"example@example.com"}`,
        subject: 'test',
        htmlBody: '<p></p>',
        spamReport: 'report',
        senderIp: '1.1.1.1',
      });
      await expect(getEmailContentList({
        userKey: 'userKey',
        email: `users@${config.allowedDomain}`,
        page: 1,
      })).to.be.rejectedWith(Error, 'data mismatch');
    });

    it('should throw error for wrong email, user combination', async () => {
      await expect(getEmailContentList({
        userKey: 'userKeys',
        email: `users@${config.allowedDomain}`,
        page: 1,
      })).to.be.rejectedWith(Error, 'data mismatch');
    });

    it('should get list of emailContent for correct arguments', async () => {
      await createEmailContent({
        envelope: `{"to":["user@${config.allowedDomain}", "user@example.com"],"from":"example@example.com"}`,
        subject: 'test',
        htmlBody: '<p></p>',
        spamReport: 'report',
        senderIp: '1.1.1.1',
      });
      const emails = await getEmailContentList({
        userKey: 'userKey',
        email: `user@${config.allowedDomain}`,
        page: 1,
      });

      // eslint-disable-next-line no-unused-expressions
      expect(emails).to.be.an('Array').that.is.not.empty;
    });

    it('should throw error for wrong user, email', async () =>{
      const emailContent = await createEmailContent({
        envelope: `{"to":["user@${config.allowedDomain}", "user@example.com"],"from":"example@example.com"}`,
        subject: 'test',
        htmlBody: '<p></p>',
        spamReport: 'report',
        senderIp: '1.1.1.1',
      });
      await expect(getEmailContent({
        userKey: 'userKey2',
        emailContentId: emailContent.id,
      })).to.be.rejectedWith(Error, 'data mismatch');
    });

    it('should throw error for no args', async () => {
      await expect(getEmailContent({
      })).to.be.rejectedWith(Error, 'data mismatch');
    });

    it('should get email content for correct args', async () => {
      const createdEmailContent = await createEmailContent({
        envelope: `{"to":["user@${config.allowedDomain}", "user@example.com"],"from":"example@example.com"}`,
        subject: 'test',
        htmlBody: '<p></p>',
        spamReport: 'report',
        senderIp: '1.1.1.1',
      });

      const emailContent = await getEmailContent({
        userKey: 'userKey',
        emailContentId: createdEmailContent.id,
      });
      // eslint-disable-next-line no-unused-expressions
      expect(emailContent).not.to.be.null;
    });
  });
});
