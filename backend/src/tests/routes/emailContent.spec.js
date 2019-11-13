import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

import app from '../../app';
import db from '../../database';
import User from '../../models/user';
import EmailAddressModel from '../../models/emailAddress';
import config from '../../config';

chai.use(chaiHttp);

describe('EmailContent Route', () => {
  let user;

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

  describe('POST /create', () => {
    it('should return 400 status for no param', async () => {
      const res = await chai.request(app)
        .post('/emailContent/create');

      // eslint-disable-next-line no-unused-expressions
      expect(res).to.have.status(400);
    });

    it('should return 400 status for missing param', async () => {
      const res = await chai.request(app)
        .post('/emailContent/create')
        .type('form')
        .send({
          subject: 'test',
          htmlBody: '<p></p>',
          spamReport: 'report',
          senderIp: '1.1.1.1',
        });
      // eslint-disable-next-line no-unused-expressions
      expect(res).to.have.status(400);
    });

    it('should return 200 status for correct params', async () => {

      const res = await chai.request(app)
        .post('/emailContent/create')
        .type('form')
        .send({
          envelope: `{"to":["user@${config.allowedDomain}", "user@example.com"],"from":"example@example.com"}`,
          subject: 'test',
          htmlBody: '<p></p>',
          spamReport: 'report',
          senderIp: '1.1.1.1',
        });
      // eslint-disable-next-line no-unused-expressions
      expect(res).to.have.status(200);
    });
  });
});
