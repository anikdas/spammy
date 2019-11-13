import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

import app from '../../app';
import db from '../../database';

chai.use(chaiHttp);

describe('User Route', () => {
  beforeEach(async () => {
    await db.sync({ force: true });
  });

  describe('GET /generate', () => {
    it('should return success true with userKey', () => chai.request(app)
      .get('/user/generate')
      .then((res) => {
        // eslint-disable-next-line no-unused-expressions
        expect(res).to.have.status(200);
        // eslint-disable-next-line no-unused-expressions
        expect(res.body.success).to.be.true;
        // eslint-disable-next-line no-unused-expressions
        expect(res.body.data).to.be.a('string');
        return Promise.resolve();
      }));
  });
});
