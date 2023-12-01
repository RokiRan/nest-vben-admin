import { ConfigType, registerAs } from '@nestjs/config'

import { env, envNumber } from '~/global/env'

export const AppConfig = registerAs('app', () => ({
  name: env('APP_NAME'),
  port: envNumber('APP_PORT', 3000),
  globalPrefix: env('GLOBAL_PREFIX'),
  locale: env('APP_LOCALE', 'zh-CN'),

  logger: {
    level: env('LOGGER_LEVEL'),
    maxFiles: envNumber('LOGGER_MAX_FILES'),
  },
}))

export type IAppConfig = ConfigType<typeof AppConfig>
