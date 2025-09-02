import { SetMetadata } from '@nestjs/common';

export const MIN_GOD_LEVEL_KEY = 'minGodLevel';
export const MinGodLevel = (level: number) => SetMetadata(MIN_GOD_LEVEL_KEY, level);