import { expect } from 'chai';
import UserModel, {
  createUser,
  getUserByKey,
} from '../../models/user';

describe('User model', () => {
  beforeEach(async () => {
    await UserModel.sync({ force: true });
  });

  describe('user creation success', () => {
    it('should create a user and return it', async () => {
      const user = await createUser();
      // eslint-disable-next-line no-unused-expressions
      expect(user).not.to.be.null;
      expect(user.key).to.be.an('string');
    });
  });

  describe('user fetch', () => {
    beforeEach(async () => {
      UserModel.create({
        key: 'testKey',
      });
    });

    afterEach(async () => {
      UserModel.truncate();
    });
    it('should not fetch user for invalid key', async () => {
      const user = await getUserByKey({
        key: 'wrongKey',
      });
      // eslint-disable-next-line no-unused-expressions
      expect(user).to.be.null;
    });

    it('should fetch user for valid key', async () => {
      const user = await getUserByKey({
        key: 'testKey',
      });
      // eslint-disable-next-line no-unused-expressions
      expect(user.key).to.equal('testKey');
    });
  });
});
