"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { useMatchConversations, useMatchMessages, useSendMatchMessage } from "../hooks/useMessages";
export function ConversationView({ matchConnectionId }: { matchConnectionId: string }) {
  const pathname=usePathname(); const role=pathname.startsWith("/landlord")?"landlord":"tenant"; const conversations=useMatchConversations(); const summary=conversations.data?.find(c=>c.matchConnectionId===matchConnectionId); const {data=[],isLoading}=useMatchMessages(matchConnectionId); const send=useSendMatchMessage(matchConnectionId); const [body,setBody]=useState(""); const valid=!!body.trim()&&body.length<=1000;
  return <div className="flex h-full flex-col gap-3"><header className="flex items-center justify-between"><Link href={`/${role}/messages`}>رجوع</Link><div><p className="font-bold">{summary?.otherParticipantName??"المحادثة"}</p><p className="text-small text-muted">{summary?.propertyTitle}</p></div></header><div className="flex-1 space-y-2">{isLoading?"جارٍ التحميل":data.map(m=><p key={m.id} className={m.isMine?"ms-auto w-fit rounded-card bg-primary p-3 text-white":"me-auto w-fit rounded-card bg-surface p-3"}>{m.body}</p>)}</div><textarea value={body} maxLength={1000} onChange={e=>setBody(e.target.value)} /><Button disabled={!valid||send.isPending} onClick={()=>send.mutate({body:body.trim()},{onSuccess:()=>setBody("")})}>إرسال</Button></div>;
}
