import mongoose from "mongoose";
import User from "../../models/user";
import bcrypt from "bcryptjs";

describe("User model", () => {
  beforeAll(async () => {
    // Connect to in-memory MongoDB
    await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  test("should hash password before save only if modified", async () => {
    const plainPassword = "password123";

    const user = new User({
      email: "test@example.com",
      password: plainPassword,
    });

    await user.save();

    expect(user.password).not.toBe(plainPassword);
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    expect(isMatch).toBe(true);

    // If password is not modified, hash should not run again
    const oldPasswordHash = user.password;
    user.email = "test2@example.com";
    await user.save();
    expect(user.password).toBe(oldPasswordHash);
  });

  test("createPasswordResetToken generates token and sets expiration", () => {
    const user = new User({
      email: "reset@example.com",
      password: "irrelevant",
    });

    const resetToken = user.createPasswordResetToken();

    expect(typeof resetToken).toBe("string");
    expect(resetToken).toHaveLength(64); // 32 bytes hex string

    expect(user.passwordResetToken).toBeDefined();
    expect(user.passwordResetExpires.getTime()).toBeGreaterThan(Date.now());

  });

  test("email is required", async () => {
    const user = new User({ password: "pass" });
    let err;
    try {
      await user.validate();
    } catch (e) {
      err = e;
    }
    expect(err.errors.email).toBeDefined();
  });

  test("password is required", async () => {
    const user = new User({ email: "test@example.com" });
    let err;
    try {
      await user.validate();
    } catch (e) {
      err = e;
    }
    expect(err.errors.password).toBeDefined();
  });
});
