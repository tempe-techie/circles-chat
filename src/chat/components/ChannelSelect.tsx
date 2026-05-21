import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChatChannel, UserGroup } from '../types';

type ChannelSelectProps = {
  channel: ChatChannel;
  groups: UserGroup[];
};

export function ChannelSelect({ channel, groups }: ChannelSelectProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLabel =
    channel.kind === 'general' ? '#general' : channel.channelName;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const selectGeneral = () => {
    setOpen(false);
    navigate('/');
  };

  const selectGroup = (group: UserGroup) => {
    setOpen(false);
    navigate(`/group/${group.address}`);
  };

  const isGeneralActive = channel.kind === 'general';
  const activeGroupAddress =
    channel.kind === 'group' ? channel.address.toLowerCase() : null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-200 hover:text-white"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{currentLabel}</span>
        <span
          className={`text-slate-500 text-xs transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-20 mt-1 min-w-[12rem] rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-lg"
        >
          <li role="option" aria-selected={isGeneralActive}>
            <button
              type="button"
              onClick={selectGeneral}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-800 ${
                isGeneralActive
                  ? 'text-emerald-400 font-medium'
                  : 'text-slate-200'
              }`}
            >
              #general
            </button>
          </li>
          {groups.map((group) => {
            const active =
              activeGroupAddress === group.address.toLowerCase();
            return (
              <li
                key={group.address}
                role="option"
                aria-selected={active}
              >
                <button
                  type="button"
                  onClick={() => selectGroup(group)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-800 ${
                    active
                      ? 'text-emerald-400 font-medium'
                      : 'text-slate-200'
                  }`}
                >
                  {group.channelName}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
