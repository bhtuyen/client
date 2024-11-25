import { MessageKeys, NamespaceKeys, NestedKeyOf, NestedValueOf } from 'next-intl';
import en from '~/en.json';

export type MessageType = typeof en;

export type TMessageKeys<NestedKey extends NamespaceKeys<IntlMessages, NestedKeyOf<IntlMessages>>> = MessageKeys<
  NestedValueOf<
    {
      '!': IntlMessages;
    },
    [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
  >,
  NestedKeyOf<
    NestedValueOf<
      {
        '!': IntlMessages;
      },
      [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
    >
  >
>;

export type TMessageOption<NestedKey extends NamespaceKeys<IntlMessages, NestedKeyOf<IntlMessages>>> = {
  key: TMessageKeys<NestedKey>;
  values?: Record<string, string | number | boolean | Date | null | undefined>;
};
