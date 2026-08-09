 import { createLogger, format, transports } from "winston";
 const { combine, timestamp, printf, colorize } = format;
 export const logger = createLogger({
    level: "info",
    format: combine(
      format.errors({ stack: true }),
      timestamp({format:"DD-MM-YYYY HH:mm:ss"}),
      printf(({ level, message, timestamp, stack }) => `${timestamp} [${level.toUpperCase()}]: ${message} - ${stack}`)
    ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "app.log", format: combine(colorize({ all: false })) })
  ],
  exitOnError: false,
  exceptionHandlers: [
    new transports.File({ filename: 'exceptions.log', handleExceptions: true, handleRejections: true })
  ]});