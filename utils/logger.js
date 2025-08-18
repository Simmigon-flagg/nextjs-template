// lib/logEvent.js
import { connectToDatabase } from "./database";
import LogEvent from "../models/LogEvent.js";

export async function logEvent({
  level = "info",
  message,
  meta = {},
  userId = null,
}) {
  try {
    // ensure one persistent connection
    await connectToDatabase();
    const log = await LogEvent.create({ level, message, meta, userId });
    console.log("Logs:\n\n\n",log,"\n\n\n")
    return log; // return the saved log doc if caller wants to inspect it
  } catch (err) {
    // don’t throw -> avoid recursive logging failures
    console.error("Failed to save log:", err.message);
    return null;
  }
}
