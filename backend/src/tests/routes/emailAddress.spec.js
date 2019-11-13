import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

import app from '../../app';
import EmailAddressModel from '../../models/emailAddress';
import UserModel from '../../models/user';
import db from '../../database';

chai.use(chaiHttp);


describe('EmailAddress', () => {
  beforeEach(async () => {
    await db.sync({ force: true });
  });

  describe('GET /emailAddress', () => {
    context('when no email present for user', () => {
      it('should return success false with message', () => chai.request(app)
        .get('/emailAddress/invalidUser')
        .then((res) => {
          // eslint-disable-next-line no-unused-expressions
          expect(res).to.have.status(200);
          // eslint-disable-next-line no-unused-expressions
          expect(res.body.success).to.be.false;
          // eslint-disable-next-line no-unused-expressions
          expect(res.body.message).to.be.a('string');
          return Promise.resolve();
        }));
    });

    describe('create email address for user', () => {

      it('should not create email address for user', async () => {
        await UserModel.create({
          key: 'user3',
        });
        const res = await chai.request(app)
          .post('/emailAddress/user3')
          .type('json')
          .send({

          });
        // eslint-disable-next-line no-unused-expressions
        expect(res).to.have.status(200);
        // eslint-disable-next-line no-unused-expressions
        expect(res.body.success).to.be.false;
        return 1;
      });

      it('should create email address for user', async () => {
        await UserModel.create({
          key: 'user3',
        });
        const res = await chai.request(app)
          .post('/emailAddress/user3')
          .type('json')
          .send({
            email: 'user3',
          });
        // eslint-disable-next-line no-unused-expressions
        expect(res).to.have.status(200);
        expect(res.body.data).to.be.a('string');
        expect(res.body.data).to.equal('user3@gotta.email');
        return 1;
      });
    });

    context('when email present for user', () => {
      const emails = [{
        address: 'user1@example.com',
        userKey: 'userKey1',
      }, {
        address: 'user2@example.com',
        userKey: 'userKey2',
      }];

      beforeEach(async () => {
        for (let iterator = 0; iterator < emails.length; iterator += 1) {
          // eslint-disable-next-line no-await-in-loop
          const email = await EmailAddressModel.create({
            address: emails[iterator].address,
          });
          // eslint-disable-next-line no-await-in-loop
          const user = await UserModel.create({
            key: emails[iterator].userKey,
          });

          // eslint-disable-next-line no-await-in-loop
          await user.setEmails(email);
        }
      });
      afterEach(async () => {
        await EmailAddressModel.truncate();
        await UserModel.truncate();
      });

      it('should return non empty list of emailAddress', () => {
        return chai.request(app)
          .get('/emailAddress/userKey1')
          .then((res) => {
            // eslint-disable-next-line no-unused-expressions
            expect(res).to.have.status(200);

            expect(res.body.data).to.be.an('Array');
            // eslint-disable-next-line no-unused-expressions
            const emailAddress = res.body.data[0];
            expect(emailAddress.address).to.equal(emails[0].address);
          });
      });
    });
  });
});
