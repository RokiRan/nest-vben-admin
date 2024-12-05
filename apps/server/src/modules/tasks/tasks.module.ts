import { DynamicModule, ExistingProvider, Module } from '@nestjs/common'

import { LogModule } from '@server/modules/system/log/log.module'
import { SystemModule } from '@server/modules/system/system.module'
import { FootballModule } from '@server/modules/football/football.module'

import { EmailJob } from './jobs/email.job'
import { HttpRequestJob } from './jobs/http-request.job'
import { LogClearJob } from './jobs/log-clear.job'

const jobProviders = [
  {
    provide: 'LogClearJob',
    useClass: LogClearJob,
  },
  {
    provide: 'HttpRequestJob',
    useClass: HttpRequestJob,
  },
  {
    provide: 'EmailJob',
    useClass: EmailJob,
  },
];

function createAliasProviders(): ExistingProvider[] {
  const aliasProviders: ExistingProvider[] = []
  for (const p of jobProviders) {
    console.debug(`Creating alias provider: ${p.provide}`)
    aliasProviders.push({
      provide: p.provide,
      useExisting: p.provide,
    })
  }
  return aliasProviders
}

/**
 * 所有需要执行的定时任务都需要在这里注册
 */
@Module({})
export class TasksModule {
  static forRoot(): DynamicModule {
    const aliasProviders = createAliasProviders()
    return {
      global: true,
      module: TasksModule,
      imports: [SystemModule, LogModule, FootballModule],
      providers: [...jobProviders, ...aliasProviders],
      exports: [...jobProviders, ...aliasProviders],
    }
  }
}
