import en from '~/en.json';

export type MessageType = typeof en;

export type KeysOfMessageType<K extends keyof MessageType> = keyof MessageType[K];
