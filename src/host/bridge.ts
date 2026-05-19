export {
  onAppData,
  onWalletChange,
  sendTransactions,
  signMessage,
} from '@aboutcircles/miniapp-sdk';

export function isMiniappMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.parent !== window;
  } catch {
    return false;
  }
}
