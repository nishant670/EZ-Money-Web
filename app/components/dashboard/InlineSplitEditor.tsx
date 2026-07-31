"use client";

import React from "react";
import Link from "next/link";
import { Equal, Plus, Trash2, Users } from "lucide-react";
import { EntrySplitInput, SplitDirection, SplitFriend, SplitGroup } from "@/app/lib/api";

const fieldClass = "min-h-10 w-full rounded-xl border border-border bg-white px-3 py-2 text-xs outline-none focus:ring-4 focus:ring-accent/10 dark:bg-zinc-900";

export default function InlineSplitEditor({ amount, friends, groups, value, onChange }: { amount: number; friends: SplitFriend[]; groups: SplitGroup[]; value: EntrySplitInput | null; onChange: (value: EntrySplitInput | null) => void }) {
    const participants = value?.participants || [];
    const setParticipants = (next: EntrySplitInput["participants"]) => onChange({ ...(value || {}), participants: next });
    const addParticipant = () => setParticipants([...participants, { friend_id: undefined, share_amount: 0, direction: "friend_owes_user" }]);
    const updateParticipant = (index: number, patch: Partial<EntrySplitInput["participants"][number]>) => setParticipants(participants.map((participant, itemIndex) => itemIndex === index ? { ...participant, ...patch } : participant));
    const chooseGroup = (raw: string) => {
        const groupID = raw ? Number(raw) : undefined;
        const group = groups.find((item) => item.id === groupID);
        const share = group?.members?.length && amount ? Number((amount / (group.members.length + 1)).toFixed(2)) : 0;
        onChange({ group_id: groupID, participants: group?.members?.map((member) => ({ friend_id: member.friend_id, share_amount: share, direction: "friend_owes_user" as SplitDirection })) || participants });
    };
    const splitEqually = () => {
        const share = participants.length && amount ? Number((amount / (participants.length + 1)).toFixed(2)) : 0;
        setParticipants(participants.map((participant) => ({ ...participant, share_amount: share })));
    };

    return <section className="rounded-2xl border border-border bg-zinc-50 p-4 dark:bg-zinc-800/50">
        <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked ? { participants: [{ friend_id: undefined, share_amount: 0, direction: "friend_owes_user" }] } : null)} className="mt-1 h-4 w-4 accent-[#FF8865]" /><span><span className="block text-sm font-bold">Split this expense</span><span className="mt-1 block text-xs text-zinc-400">Create the transaction and linked split bill together.</span></span></label>
        {value && <div className="mt-5 space-y-4 border-t border-border pt-4">
            {friends.length === 0 ? <div className="rounded-xl bg-white p-4 text-xs text-zinc-500 dark:bg-zinc-900">Add a friend in <Link href="/dashboard/splits" className="font-bold text-accent underline">Splits</Link> before saving this shared expense.</div> : <>
                {groups.length > 0 && <label className="space-y-2"><span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400"><Users className="h-3.5 w-3.5" /> Group</span><select value={value.group_id || ""} onChange={(event) => chooseGroup(event.target.value)} className={fieldClass}><option value="">No group</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>}
                <div className="flex items-center justify-between"><p className="text-xs font-bold">Friend shares</p><button type="button" onClick={splitEqually} className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-2.5 py-1.5 text-[10px] font-bold text-accent"><Equal className="h-3 w-3" /> Equal</button></div>
                <div className="space-y-2">{participants.map((participant, index) => <div key={index} className="grid gap-2 sm:grid-cols-[1fr_100px_120px_auto]">
                    <select value={participant.friend_id || ""} onChange={(event) => updateParticipant(index, { friend_id: Number(event.target.value) || undefined })} aria-label={`Split friend ${index + 1}`} className={fieldClass}><option value="">Friend</option>{friends.map((friend) => <option key={friend.id} value={friend.id}>{friend.name}</option>)}</select>
                    <input type="number" min="0.01" step="0.01" value={participant.share_amount || ""} onChange={(event) => updateParticipant(index, { share_amount: Number(event.target.value) })} aria-label={`Split share ${index + 1}`} placeholder="Share" className={fieldClass} />
                    <select value={participant.direction} onChange={(event) => updateParticipant(index, { direction: event.target.value as SplitDirection })} aria-label={`Split direction ${index + 1}`} className={fieldClass}><option value="friend_owes_user">Owes me</option><option value="user_owes_friend">I owe</option></select>
                    <button type="button" disabled={participants.length === 1} onClick={() => setParticipants(participants.filter((_, itemIndex) => itemIndex !== index))} className="grid h-10 w-10 place-items-center rounded-xl text-zinc-400 hover:text-red-600 disabled:opacity-30" aria-label={`Remove split friend ${index + 1}`}><Trash2 className="h-3.5 w-3.5" /></button>
                </div>)}</div>
                <button type="button" onClick={addParticipant} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2 text-xs font-bold text-zinc-500"><Plus className="h-3.5 w-3.5" /> Add friend</button>
            </>}
        </div>}
    </section>;
}
