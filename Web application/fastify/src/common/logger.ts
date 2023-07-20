import pino from 'pino'
import pretty from 'pino-pretty'

import { config } from '@app/config'
import { Env } from './enums'

const prettyPrint = [Env.Test, Env.Local].includes(config.env)

const PinoLevelToSeverityLookup = {
  trace: 'DEBUG',
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL',
}

// https://github.com/pinojs/pino/blob/master/docs/help.md#mapping-pino-log-levels-to-google-cloud-logging-stackdriver-severity-levels
const pinoConfig = [Env.Production, Env.Staging].includes(config.env)
  ? {
      messageKey: 'message',
      formatters: {
        messageKey: 'message',
        level(label, number) {
          return {
            severity: PinoLevelToSeverityLookup[label] || PinoLevelToSeverityLookup['info'],
            level: number,
          }
        },
      },
    }
  : {}

const logger: pino.Logger = pino(
  { ...pinoConfig, ...config.logging },
  prettyPrint && pretty({ colorize: true })
)

export { logger }
