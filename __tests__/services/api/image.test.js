const { Writable } = require('stream');
import {
  uploadImageToGridFS,
  getImageFileUrl,
  updateUserImageIdByEmail,
} from "../../../services/api/image";

import User from "../../../models/user";

// Mock database connection
jest.mock("../../../utils/database", () => ({
  connectToDatabase: jest.fn().mockResolvedValue(),
}));

jest.mock("../../../models/user");

describe("Image service functions", () => {
  describe("getImageFileUrl", () => {
    it("returns file URL if image found", async () => {
      const imageId = "someid";
      const mockBucket = {
        find: jest.fn(() => ({
          toArray: jest.fn().mockResolvedValue([{ _id: { toString: () => imageId } }]),
        })),
      };

      const url = await getImageFileUrl(mockBucket, imageId);

      expect(mockBucket.find).toHaveBeenCalledWith({ _id: imageId });
      expect(url).toBe(`/api/images/${imageId}`);
    });

    it("returns null if no image found", async () => {
      const mockBucket = {
        find: jest.fn(() => ({
          toArray: jest.fn().mockResolvedValue([]),
        })),
      };

      const url = await getImageFileUrl(mockBucket, "someid");

      expect(url).toBeNull();
    });
  });

  describe("updateUserImageIdByEmail", () => {
    it("updates the user's imageId and returns the updated user", async () => {
      const mockEmail = "test@example.com";
      const mockImageId = "imageid123";

      const mockUpdatedUser = { email: mockEmail, imageId: mockImageId };

      User.findOneAndUpdate.mockResolvedValue(mockUpdatedUser);

      const result = await updateUserImageIdByEmail(mockEmail, mockImageId);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { email: mockEmail },
        { imageId: mockImageId },
        { new: true }
      );
      expect(result).toEqual(mockUpdatedUser);
    });
  });
});

describe("uploadImageToGridFS", () => {
  it("uploads file buffer to GridFS and resolves with upload id", async () => {
    const mockFile = {
      name: "test.png",
      type: "image/png",
      arrayBuffer: jest.fn().mockResolvedValue(Buffer.from("testdata")),
    };

    const mockUploadStream = new Writable({
      write(chunk, encoding, callback) {
        callback();
      }
    });
    mockUploadStream.id = "mockUploadId";
    jest.spyOn(mockUploadStream, "on").mockImplementation((event, cb) => {
      if (event === "finish") {
        setImmediate(cb);
      }
      return mockUploadStream;
    });

    const mockBucket = {
      openUploadStream: jest.fn(() => mockUploadStream),
    };

    const uploadId = await uploadImageToGridFS(mockBucket, mockFile);

    expect(mockBucket.openUploadStream).toHaveBeenCalledWith(
      "test.png",
      { contentType: "image/png" }
    );
    expect(uploadId).toBe("mockUploadId");
  });
});
