import nodemailer from "nodemailer";
import { sendEmail } from "../../utils/sendEmail";

jest.mock("nodemailer");

describe("sendEmail", () => {
  const sendMailMock = jest.fn().mockResolvedValue();

  beforeAll(() => {
    nodemailer.createTransport.mockReturnValue({
      sendMail: sendMailMock,
    });
  });

  beforeEach(() => {
    sendMailMock.mockClear();
  });

  it("creates transporter and sends email", async () => {
    process.env.EMAIL_USER = "user@example.com";
    process.env.EMAIL_PASS = "password";

    await sendEmail("to@example.com", "Subject", "Email body");

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: "Gmail",
      auth: { user: "user@example.com", pass: "password" },
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: "user@example.com",
      to: "to@example.com",
      subject: "Subject",
      text: "Email body",
    });
  });
});

