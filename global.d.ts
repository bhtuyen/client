/* eslint-disable no-unused-vars */
import type { MessageType } from '@/types/message.type';

declare global {
  // Use type safe message keys with `next-intl`
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends MessageType {}
}
