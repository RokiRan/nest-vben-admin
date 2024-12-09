import { SetMetadata } from '@nestjs/common';

export const TIMEOUT_KEY = 'timeout_value';
export const Timeout = (timeout: number) => SetMetadata(TIMEOUT_KEY, timeout);
