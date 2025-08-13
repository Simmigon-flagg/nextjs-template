import mongoose from "mongoose";
import { Writable } from "stream";
import * as todoService from "../../services/api/todo";

import Todo from "../../models/todo";

jest.mock("../../models/todo");

describe("todo service additional coverage", () => {
  beforeAll(async () => {
    // Connect to in-memory or real Mongo here if needed
    await mongoose.connect("mongodb://localhost:27017/template");
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Define a getter on mongoose.connection.db for mocking GridFSBucket usage
    Object.defineProperty(mongoose.connection, "db", {
      get: () => ({}),
      configurable: true,
    });
  });

  describe("uploadFileToGridFS", () => {
    it("rejects if uploadStream emits error", async () => {
      const mockBucket = {
        openUploadStream: jest.fn(() => {
          const stream = new Writable({
            write(chunk, encoding, callback) {
              callback();
            },
          });
          stream.id = new mongoose.Types.ObjectId();

          stream.on = (event, cb) => {
            if (event === "error") {
              setTimeout(() => cb(new Error("upload failed")), 0);
            }
            return stream;
          };

          return stream;
        }),
      };

      jest.spyOn(require("mongodb"), "GridFSBucket").mockImplementation(() => mockBucket);

      const file = {
        name: "file.txt",
        type: "text/plain",
        arrayBuffer: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
      };

      await expect(todoService.uploadFileToGridFS(file)).rejects.toThrow("upload failed");
    });
  });

  describe("createTodoForUser", () => {
    it("creates a todo with given data", async () => {
      const saveMock = jest.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        title: "Test Todo",
        userId: "userid",
      });

      Todo.mockImplementation(() => ({
        save: saveMock,
      }));

      const todoData = { title: "Test Todo", notes: "Some notes", fileData: null };

      const saved = await todoService.createTodoForUser("userid", todoData);

      expect(saved).toBeDefined();
      expect(saveMock).toHaveBeenCalled();
    });
  });
});
