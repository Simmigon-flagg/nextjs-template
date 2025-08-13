import mongoose from "mongoose";
import Image from "../../models/image"; // adjust path

describe("Image model", () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Image.deleteMany({});
  });

  test("creates an image with required url and optional filename", async () => {
    const image = await Image.create({
      url: "http://example.com/image.jpg",
      filename: "image.jpg",
    });

    expect(image.url).toBe("http://example.com/image.jpg");
    expect(image.filename).toBe("image.jpg");
    expect(image.uploadedAt).toBeInstanceOf(Date);
    expect(image.createdAt).toBeInstanceOf(Date);
    expect(image.updatedAt).toBeInstanceOf(Date);
  });

  test("creates an image without filename", async () => {
    const image = await Image.create({
      url: "http://example.com/image2.jpg",
    });

    expect(image.url).toBe("http://example.com/image2.jpg");
    expect(image.filename).toBeUndefined();
  });

  test("validation fails if url is missing", async () => {
    const image = new Image({});

    let error;
    try {
      await image.validate();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.url).toBeDefined();
  });
});
