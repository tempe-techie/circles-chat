import { signMessage } from '../host/bridge';
import { deleteMessage, postMessage } from './api';
import { DELETE_SIGN_PREFIX } from './constants';

export async function postMainMessage(
  author: string,
  text: string,
): Promise<void> {
  await postMessage(author, text);
}

export async function deleteMainMessage(key: string): Promise<void> {
  const signPayload = `${DELETE_SIGN_PREFIX}${key}`;
  const { signature } = await signMessage(signPayload);
  await deleteMessage(key, signature);
}
