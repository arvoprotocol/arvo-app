'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Mail, MessageCircle, Search, Send, Users, X } from 'lucide-react';
import { PageTitle, StatCard } from '@/components/protocol/ProtocolUI';
import { appPath } from '@/lib/protocol/app-url';
import { EmailComposer } from '../emails/EmailComposer';

type Signup = { id: number; type: string; contact: string; source: string; createdAt: string; notifiedAt: string | null; unsubscribedAt: string | null };
type Recipient = { email: string; name: string };
const PAGE_SIZE = 25;
const button = 'inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold transition hover:border-black/25 disabled:cursor-not-allowed disabled:opacity-40';
function emailSignup(signup: Signup) {
  return signup.type === 'email' && !signup.unsubscribedAt && signup.contact.length <= 254 && /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(signup.contact.trim());
}
function recipientsFor(signups: Signup[]): Recipient[] {
  return [...new Set(signups.filter(emailSignup).map(s => s.contact.trim().toLowerCase()))].map(email => ({ email, name: '' }));
}
function date(value: string) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/London' }).format(new Date(value));
}

type TelegramInvite = { id: number; message: string; chat: string; copied: boolean };
const telegramHandle = (s: Signup) => s.type === 'telegram' && /^@?[a-zA-Z0-9_]{5,32}$/.test(s.contact.trim()) && !s.unsubscribedAt;

export function WaitlistManager({ signups: initial }: { signups: Signup[] }) {
  const [signups, setSignups] = useState(initial);
  const [invite, setInvite] = useState<TelegramInvite | null>(null);
  const [inviteError, setInviteError] = useState('');
  const [preparing, setPreparing] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [draft, setDraft] = useState<{ key: number; recipients: Recipient[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const composer = useRef<HTMLDivElement>(null);
  const allEmails = useMemo(() => recipientsFor(signups), [signups]);
  const notInvitedEmails = useMemo(() => recipientsFor(signups.filter(s => !s.notifiedAt)), [signups]);
  const telegram = signups.filter(telegramHandle), telegramWaiting = telegram.filter(s => !s.notifiedAt);

  async function prepareTelegram(s: Signup) {
    if (preparing) return;
    setPreparing(s.id); setInviteError('');
    try {
      const response = await fetch('/api/admin/waitlist/telegram-invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not prepare the invite.');
      let copied = false;
      try { await navigator.clipboard.writeText(data.message); copied = true; } catch { /* shown for manual copy */ }
      setInvite({ id: s.id, message: data.message, chat: data.chat, copied });
      setSignups(all => all.map(x => x.id === s.id ? { ...x, notifiedAt: new Date().toISOString() } : x));
    } catch (e) { setInviteError(e instanceof Error ? e.message : 'Could not prepare the invite.'); }
    finally { setPreparing(null); }
  }
  async function copyInvite() {
    if (!invite) return;
    try { await navigator.clipboard.writeText(invite.message); setInvite({ ...invite, copied: true }); } catch { setInviteError('Copy the message from the box.'); }
  }
  const nextTelegram = telegramWaiting.find(s => s.id !== invite?.id);
  const filtered = useMemo(() => signups.filter(s => (type === 'all' || s.type === type) && `${s.contact} ${s.source}`.toLowerCase().includes(query.trim().toLowerCase())), [signups, type, query]);
  const selectedRows = signups.filter(s => selected.has(s.id) && emailSignup(s));
  const filteredEmails = filtered.filter(emailSignup);
  const lastPage = Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1);
  const activePage = Math.min(page, lastPage);
  const visible = filtered.slice(activePage * PAGE_SIZE, (activePage + 1) * PAGE_SIZE);
  const allFilteredSelected = filteredEmails.length > 0 && filteredEmails.every(s => selected.has(s.id));

  function toggle(id: number) {
    setSelected(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }
  function selectMatching() {
    setSelected(current => { const next = new Set(current); for (const s of filteredEmails) { if (allFilteredSelected) next.delete(s.id); else next.add(s.id); } return next; });
  }
  function compose(recipients: Recipient[]) {
    if (busy || !recipients.length) return;
    if (draft && !window.confirm('Replace the current email draft and recipients?')) return;
    setDraft(current => ({ key: (current?.key ?? 0) + 1, recipients }));
    setTimeout(() => composer.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }

  return <div className="px-4 py-7 md:px-7 lg:px-9 lg:py-9 xl:px-11">
    <PageTitle eyebrow="Communications" title="Waitlist" copy="View website signups and email your early-access subscribers." />
    <div className="mt-7 grid gap-4 sm:grid-cols-3">
      <StatCard label="Total signups" value={String(signups.length)} icon={<Users size={17} />} />
      <StatCard label="Email subscribers" value={String(allEmails.length)} icon={<Mail size={17} />} />
      <StatCard label="Telegram signups" value={String(signups.filter(s => s.type === 'telegram').length)} icon={<MessageCircle size={17} />} />
    </div>
    <section aria-labelledby="send-invites" className="mt-7 rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm md:p-6">
      <h2 id="send-invites" className="text-lg font-semibold">Send early-access invites</h2>
      <p className="mt-1 text-sm text-black/60">Everyone gets their own invite code. Sending again reuses the same code.</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-black/[0.08] bg-[#fbfaf9] p-5">
          <p className="flex items-center gap-2 text-sm font-semibold"><Mail size={16} className="text-[#ad7058]" />Email</p>
          <p className="mt-2 text-sm leading-6 text-black/65">{allEmails.length ? <>{notInvitedEmails.length} of {allEmails.length} email subscribers not invited yet. Opens a ready-written email; send yourself a test first.</> : 'No email subscribers yet.'}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={`${button} !bg-[#07090b] !text-white`} disabled={busy || !notInvitedEmails.length} onClick={() => compose(notInvitedEmails)}><Send size={15} />Invite the {notInvitedEmails.length} not yet invited</button>
            <button type="button" className={button} disabled={busy || !allEmails.length} onClick={() => compose(allEmails)}>Everyone ({allEmails.length})</button>
          </div>
        </div>
        <div className="rounded-2xl border border-black/[0.08] bg-[#fbfaf9] p-5">
          <p className="flex items-center gap-2 text-sm font-semibold"><MessageCircle size={16} className="text-[#ad7058]" />Telegram</p>
          <p className="mt-2 text-sm leading-6 text-black/65">{telegram.length ? <>{telegramWaiting.length} of {telegram.length} Telegram signups not invited yet. Telegram can’t be messaged automatically: prepare an invite, then paste it into their chat.</> : 'No Telegram signups yet.'}</p>
          {invite ? <div className="mt-4 rounded-xl border border-[#c9846a]/30 bg-white p-4">
            <p className="text-xs font-semibold text-[#ad7058]">{invite.copied ? 'Message copied. Open the chat and paste it.' : 'Copy this message, then open the chat.'}</p>
            <textarea readOnly value={invite.message} rows={6} className="mt-2 w-full resize-none rounded-lg border border-black/10 bg-[#fbfaf9] p-3 text-xs leading-5" onFocus={e => e.currentTarget.select()} />
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className={button} onClick={() => void copyInvite()}>{invite.copied ? <Check size={15} /> : <Copy size={15} />}{invite.copied ? 'Copied' : 'Copy message'}</button>
              <a href={invite.chat} target="_blank" rel="noopener noreferrer" className={`${button} !bg-[#07090b] !text-white`}><MessageCircle size={15} />Open {signups.find(x => x.id === invite.id)?.contact} in Telegram</a>
              {nextTelegram && <button type="button" className={button} disabled={preparing !== null} onClick={() => void prepareTelegram(nextTelegram)}>Next: {nextTelegram.contact}</button>}
            </div>
          </div> : <div className="mt-4"><button type="button" className={`${button} !bg-[#07090b] !text-white`} disabled={!telegramWaiting.length || preparing !== null} onClick={() => telegramWaiting[0] && void prepareTelegram(telegramWaiting[0])}><Send size={15} />{preparing ? 'Preparing…' : telegramWaiting.length ? `Start with ${telegramWaiting[0].contact}` : 'Everyone is invited'}</button></div>}
          {inviteError && <p role="alert" className="mt-3 text-xs text-red-700">{inviteError}</p>}
        </div>
      </div>
    </section>
    <div className="mt-7 rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Website signups</h2>
        <div className="flex flex-wrap gap-2">
          <Link href={appPath('/app/admin/emails')} className={button}>Email history</Link>
          
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1"><span className="sr-only">Search waitlist</span><Search size={16} className="absolute left-3 top-3.5 text-black/55" /><input value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} placeholder="Search contact or source" className="w-full rounded-xl border border-black/10 bg-[#fbfaf9] py-3 pl-10 pr-4 text-sm outline-none focus:border-black/30" /></label>
        <label><span className="sr-only">Signup type</span><select value={type} onChange={e => { setType(e.target.value); setPage(0); }} className="w-full rounded-xl border border-black/10 bg-[#fbfaf9] px-4 py-3 text-sm md:w-48"><option value="all">All signups</option><option value="email">Email</option><option value="telegram">Telegram</option></select></label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className={button} disabled={!filteredEmails.length} onClick={selectMatching}>{allFilteredSelected ? 'Deselect matching emails' : 'Select matching emails'} ({filteredEmails.length})</button>
        <button type="button" className={button} disabled={busy || !selectedRows.length} onClick={() => compose(recipientsFor(selectedRows))}>Email selected ({selectedRows.length})</button>
        {!!selected.size && <button type="button" onClick={() => setSelected(new Set())} className="text-xs font-semibold text-black/50">Clear selection</button>}
      </div>
      <p className="mt-3 text-xs leading-5 text-black/60">Selection covers matching email records across all pages. Telegram-only signups have no email address. Unsubscribed contacts are excluded from all sends, and every waitlist email includes an unsubscribe link. Times shown are UK time.</p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead><tr className="border-b border-black/10 text-xs text-black/60"><th className="w-10 py-3 pr-3"><span className="sr-only">Select</span></th><th className="px-3 py-3 font-semibold">Contact</th><th className="px-3 py-3 font-semibold">Type</th><th className="px-3 py-3 font-semibold">Signed up</th><th className="px-3 py-3 font-semibold">Source</th><th className="py-3 pl-3 font-semibold">Action</th></tr></thead>
          <tbody>{visible.length ? visible.map(s => <tr key={s.id} className="border-b border-black/[0.06] last:border-0">
            <td className="py-4 pr-3">{emailSignup(s) && <input type="checkbox" checked={selected.has(s.id)} aria-label={`Select ${s.contact}`} onChange={() => toggle(s.id)} className="accent-[#07090b]" />}</td>
            <td className="max-w-[300px] break-words px-3 py-4 font-medium">{s.contact}</td>
            <td className="px-3 py-4"><span className="rounded-full bg-[#f8f2ed] px-2.5 py-1 text-xs font-semibold">{s.type === 'email' ? 'Email' : s.type === 'telegram' ? 'Telegram' : s.type}</span>{s.unsubscribedAt ? <span className="ml-2 rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold text-black/60">Unsubscribed</span> : s.notifiedAt ? <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"><Check size={12} />Invited</span> : null}</td>
            <td className="whitespace-nowrap px-3 py-4 text-xs text-black/55">{date(s.createdAt)}</td>
            <td className="px-3 py-4 text-xs text-black/55">{s.source || '–'}</td>
            <td className="py-4 pl-3">{emailSignup(s) ? <button type="button" disabled={busy} className="inline-flex items-center gap-1.5 text-xs font-semibold disabled:opacity-40" onClick={() => compose(recipientsFor([s]))}><Mail size={14} />Email</button> : telegramHandle(s) ? <button type="button" disabled={preparing !== null} onClick={() => { void prepareTelegram(s); document.getElementById('send-invites')?.scrollIntoView({ behavior: 'smooth' }); }} className="inline-flex items-center gap-1.5 text-xs font-semibold disabled:opacity-40"><MessageCircle size={14} />{s.notifiedAt ? 'Invite again' : 'Invite'}</button> : <span className="text-xs text-black/55">{s.unsubscribedAt ? 'Unsubscribed' : 'No email'}</span>}</td>
          </tr>) : <tr><td colSpan={6} className="py-12 text-center text-sm text-black/60">{signups.length ? 'No signups match this search.' : 'No waitlist signups yet.'}</td></tr>}</tbody>
        </table>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-black/50"><span>{filtered.length ? `${activePage * PAGE_SIZE + 1}–${Math.min((activePage + 1) * PAGE_SIZE, filtered.length)}` : '0'} of {filtered.length} signups</span><div className="flex items-center gap-3"><button type="button" className={button} disabled={activePage === 0} onClick={() => setPage(activePage - 1)}>Previous</button><span>Page {activePage + 1} of {lastPage + 1}</span><button type="button" className={button} disabled={activePage === lastPage} onClick={() => setPage(activePage + 1)}>Next</button></div></div>
    </div>
    {draft && <div ref={composer} className="mt-7 scroll-mt-24">
      <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Email waitlist subscribers</h2><button type="button" disabled={busy} onClick={() => { if (window.confirm('Close this email draft?')) setDraft(null); }} className={button}><X size={15} />Close</button></div>
      <EmailComposer key={draft.key} partners={[]} initialRecipients={draft.recipients} initialSubject="Your Arvo early access invitation" initialBody={'Hi,\n\nEarly access to the Arvo app is open to waitlist members before the public release.\n\nYour personal invitation code: [Invite code]\n\nOpen app.arvoprotocol.com and enter your code to get started. Please keep it to yourself.\n\nThe Arvo Team'} audienceLabel="waitlist subscribers" audience="waitlist" onBusyChange={setBusy} />
    </div>}
  </div>;
}
