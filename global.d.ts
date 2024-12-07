/* eslint-disable no-unused-vars */
import type { MessageType } from '@/types/message.type';

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends MessageType {}
}
