import { Logtail } from "@logtail/node";

const { LOGTAIL_KEY } = process.env;

const logtail = new Logtail(LOGTAIL_KEY!);

// Custom logger to log both to Logtail and console with multiple inputs
export const log = {
  info: (...args: any) => {
    console.log(...args); // Logs all arguments to the console
    logtail.info(formatLogMessage(args)); // Sends log to Logtail
  },
  warn: (...args: any) => {
    console.warn(...args); // Logs all arguments as a warning in the console
    logtail.warn(formatLogMessage(args)); // Sends log to Logtail as a warning
  },
  error: (...args: any) => {
    console.error(...args); // Logs all arguments as an error in the console
    logtail.error(formatLogMessage(args)); // Sends error to Logtail
  },
  debug: (...args: any) => {
    console.debug(...args); // Logs all arguments as debug in the console
    logtail.debug(formatLogMessage(args)); // Sends debug info to Logtail
  },
};

// Helper function to format the log message for Logtail
const formatLogMessage = (args: any) => {
  return args
    .map((arg: any) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
    .join(" ");
};
