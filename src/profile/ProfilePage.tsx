import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getAddress } from 'viem';
import {
  fetchMaxFlowCrc,
  fetchUserCrcBalance,
  formatCrcBalance,
} from '../circles/balance';
import { fetchUserProfile, type UserProfile } from '../circles/profile';
import { tipUser } from '../chat/actions';
import { MessageAvatar } from '../chat/components/MessageAvatar';
import {
  DEFAULT_TIP_CRC,
  TIP_MAX_CRC,
  TIP_MIN_CRC,
  TIP_PRESET_AMOUNTS,
} from '../chat/constants';
import { shortenAddress } from '../chat/format';
import { isMiniappMode } from '../host/bridge';

function profileNameFor(
  profile: UserProfile | null,
  address: string,
): string {
  return profile?.name ?? shortenAddress(address);
}

function TipDialog({
  wallet,
  recipient,
  recipientName,
  onClose,
  onSent,
}: {
  wallet: string;
  recipient: string;
  recipientName: string;
  onClose: () => void;
  onSent: () => void;
}) {
  const [amountText, setAmountText] = useState(String(DEFAULT_TIP_CRC));
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [maxFlow, setMaxFlow] = useState<number | null>(null);
  const [maxFlowLoading, setMaxFlowLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setBalanceLoading(true);
    fetchUserCrcBalance(wallet)
      .then((value) => {
        if (!cancelled) setBalance(value);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Could not load your balance',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setBalanceLoading(false);
      });

    setMaxFlowLoading(true);
    fetchMaxFlowCrc(wallet, recipient)
      .then((value) => {
        if (!cancelled) setMaxFlow(value);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not check if a transfer path exists',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setMaxFlowLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [wallet, recipient]);

  const amount = Number(amountText);
  const amountValid =
    Number.isFinite(amount) &&
    amount >= TIP_MIN_CRC &&
    amount <= TIP_MAX_CRC;

  const checking = balanceLoading || maxFlowLoading;
  const hasEnoughBalance = balance !== null && balance >= amount;
  const hasTransferPath = maxFlow !== null && maxFlow >= amount;
  const canSend =
    amountValid && !checking && hasEnoughBalance && hasTransferPath;

  let eligibilityError: string | null = null;
  if (!amountValid) {
    eligibilityError = `Enter an amount between ${TIP_MIN_CRC} and ${TIP_MAX_CRC} CRC.`;
  } else if (!checking) {
    if (balance !== null && !hasEnoughBalance) {
      eligibilityError = `Your balance is ${formatCrcBalance(balance)} CRC, which is not enough for a ${formatCrcBalance(amount)} CRC tip.`;
    } else if (maxFlow !== null && !hasTransferPath) {
      eligibilityError = `You can only send up to ${formatCrcBalance(maxFlow)} CRC to ${recipientName} right now.`;
    }
  }

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      await tipUser(wallet, recipient, amount);
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send tip');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        disabled={sending}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm disabled:cursor-not-allowed"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-xl bg-slate-900 p-5 shadow-xl ring-1 ring-slate-700"
      >
        <h3 className="text-base font-semibold text-slate-100">
          Tip {recipientName}
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          Send CRC directly to {recipientName} as a thank you.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {TIP_PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={sending}
              onClick={() => setAmountText(String(preset))}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition-colors disabled:opacity-50 ${
                Number(amountText) === preset
                  ? 'bg-emerald-600 text-white ring-emerald-500'
                  : 'bg-slate-800 text-slate-300 ring-slate-700 hover:bg-slate-700'
              }`}
            >
              {preset} CRC
            </button>
          ))}
        </div>

        <label className="mt-3 block">
          <span className="text-xs text-slate-500">Custom amount (CRC)</span>
          <input
            type="number"
            inputMode="decimal"
            min={TIP_MIN_CRC}
            max={TIP_MAX_CRC}
            step="1"
            value={amountText}
            disabled={sending}
            onChange={(e) => setAmountText(e.target.value)}
            className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-emerald-500 disabled:opacity-50"
          />
        </label>

        <p className="mt-3 text-xs text-slate-500">
          {checking
            ? 'Checking how much CRC you can send…'
            : balance !== null
              ? `Your balance: ${formatCrcBalance(balance)} CRC`
              : ''}
        </p>

        {(error ?? eligibilityError) && (
          <p className="mt-3 rounded-lg bg-red-950/40 px-3 py-2 text-sm text-red-300 ring-1 ring-red-900/60">
            {error ?? eligibilityError}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!canSend || sending}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {sending
              ? 'Sending…'
              : checking
                ? 'Checking…'
                : `Send ${amountValid ? formatCrcBalance(amount) : ''} CRC`}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfilePage({ wallet }: { wallet: string | null }) {
  const { address: addressParam } = useParams<{ address: string }>();

  const normalizedAddress = useMemo(() => {
    try {
      return addressParam ? getAddress(addressParam) : null;
    } catch {
      return null;
    }
  }, [addressParam]);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [tipOpen, setTipOpen] = useState(false);
  const [tipSuccess, setTipSuccess] = useState(false);

  const loadProfile = useCallback(async (address: string) => {
    setLoading(true);
    try {
      const data = await fetchUserProfile(address);
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!normalizedAddress) return;
    setProfile(null);
    setBalance(null);
    setTipSuccess(false);
    void loadProfile(normalizedAddress);
    fetchUserCrcBalance(normalizedAddress)
      .then(setBalance)
      .catch(() => setBalance(null));
  }, [normalizedAddress, loadProfile]);

  if (!normalizedAddress) {
    return <Navigate to="/" replace />;
  }

  const name = profileNameFor(profile, normalizedAddress);
  const isSelf =
    wallet != null &&
    getAddress(wallet).toLowerCase() === normalizedAddress.toLowerCase();
  const inHost = isMiniappMode();
  const canTip = Boolean(wallet) && inHost && !isSelf;

  let tipHint: string | null = null;
  if (isSelf) {
    tipHint = 'This is your profile.';
  } else if (!wallet) {
    tipHint = 'Connect your wallet to tip this user.';
  } else if (!inHost) {
    tipHint = 'Open in the Circles Playground to send a tip.';
  }

  return (
    <>
      {tipOpen && wallet && (
        <TipDialog
          wallet={wallet}
          recipient={normalizedAddress}
          recipientName={name}
          onClose={() => setTipOpen(false)}
          onSent={() => {
            setTipOpen(false);
            setTipSuccess(true);
            fetchUserCrcBalance(normalizedAddress)
              .then(setBalance)
              .catch(() => {});
          }}
        />
      )}

      <section className="rounded-xl bg-slate-900/50 ring-1 ring-slate-800 overflow-hidden">
        <div className="border-b border-slate-800 px-4 py-3">
          <Link
            to="/"
            className="text-xs font-medium text-emerald-500 hover:text-emerald-400"
          >
            ← Back to chat
          </Link>
        </div>

        <div className="p-5">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Loading profile…
            </p>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <MessageAvatar
                  profile={profile}
                  address={normalizedAddress}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-xl font-bold text-slate-100">
                    {name}
                  </h2>
                  <p className="truncate font-mono text-xs text-slate-500">
                    {shortenAddress(normalizedAddress)}
                  </p>
                </div>
              </div>

              {profile?.description && (
                <p className="mt-4 whitespace-pre-wrap text-sm text-slate-300">
                  {profile.description}
                </p>
              )}

              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
                <div className="rounded-lg bg-slate-800/60 px-3 py-2 ring-1 ring-slate-800">
                  <dt className="text-xs text-slate-500">CRC balance</dt>
                  <dd className="mt-0.5 font-medium text-slate-200">
                    {balance !== null
                      ? `${formatCrcBalance(balance)} CRC`
                      : '—'}
                  </dd>
                </div>
                <div className="rounded-lg bg-slate-800/60 px-3 py-2 ring-1 ring-slate-800">
                  <dt className="text-xs text-slate-500">Address</dt>
                  <dd className="mt-0.5 break-all font-mono text-xs text-slate-300">
                    {normalizedAddress}
                  </dd>
                </div>
              </dl>

              {tipSuccess && (
                <p className="mt-4 rounded-lg bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300 ring-1 ring-emerald-900/60">
                  Tip sent to {name}. Thank you!
                </p>
              )}

              <button
                type="button"
                disabled={!canTip}
                onClick={() => {
                  setTipSuccess(false);
                  setTipOpen(true);
                }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                Tip with CRC
              </button>

              {tipHint && (
                <p className="mt-2 text-center text-xs text-slate-500">
                  {tipHint}
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
