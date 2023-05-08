import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApiResult } from '@/decorators';
import { ApiSecurityAuth } from '@/decorators/swagger.decorator';
import { Pagination } from '@/helper/paginate/pagination';

import { Permission } from '@/modules/rbac/decorators';

import {
  CaptchaLogQueryDto,
  LoginLogQueryDto,
  TaskLogQueryDto,
} from './dto/log.dto';
import { CaptchaLogEntity } from './entities/captcha-log.entity';
import { LoginLogInfo, TaskLogInfo } from './log.modal';
import { CaptchaLogService } from './services/captcha-log.service';
import { LoginLogService } from './services/login-log.service';
import { TaskLogService } from './services/task-log.service';

@ApiSecurityAuth()
@ApiTags('System - 日志模块')
@Controller('log')
export class LogController {
  constructor(
    private loginLogService: LoginLogService,
    private taskService: TaskLogService,
    private captchaLogService: CaptchaLogService,
  ) {}

  @Get('login/list')
  @ApiOperation({ summary: '查询登录日志列表' })
  @ApiResult({ type: [LoginLogInfo], isPage: true })
  @Permission('system:log:task:list')
  async loginLogPage(
    @Query() dto: LoginLogQueryDto,
  ): Promise<Pagination<LoginLogInfo>> {
    return this.loginLogService.list(dto);
  }

  @Get('task/list')
  @ApiOperation({ summary: '查询任务日志列表' })
  @ApiResult({ type: [TaskLogInfo], isPage: true })
  @Permission('system:log:task:list')
  async taskList(
    @Query() dto: TaskLogQueryDto,
  ): Promise<Pagination<TaskLogInfo>> {
    return this.taskService.paginate(dto);
  }

  @Get('captcha/list')
  @ApiOperation({ summary: '查询验证码日志列表' })
  @ApiResult({ type: [CaptchaLogEntity], isPage: true })
  @Permission('system:log:captcha:list')
  async captchaList(
    @Query() dto: CaptchaLogQueryDto,
  ): Promise<Pagination<CaptchaLogEntity>> {
    return this.captchaLogService.paginate(dto);
  }
}
