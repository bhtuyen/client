import type { MessageKeys, NamespaceKeys, NestedKeyOf, NestedValueOf, TranslationValues } from 'next-intl';
import type en from '~/en.json';

export type MessageType = typeof en;
export type TNamespaceKeys = NamespaceKeys<IntlMessages, NestedKeyOf<IntlMessages>>;
export type TMessageKeys<NestedKey extends TNamespaceKeys = TNamespaceKeys> = MessageKeys<
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

export type TMessageOption<NestedKey extends TNamespaceKeys = TNamespaceKeys> = {
  key: TMessageKeys<NestedKey>;
  values?: TranslationValues;
};

export type TranslationFunctionParams<NestedKey extends TNamespaceKeys = TNamespaceKeys> = [TMessageKeys<NestedKey>, TranslationValues?];

export type TMessKey<NestedKey extends TNamespaceKeys = TNamespaceKeys> = TMessageOption<NestedKey> | TMessageKeys<NestedKey>;
