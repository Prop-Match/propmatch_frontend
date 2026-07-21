"use client";
import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { useMatchMessages, useSendMatchMessage } from "../hooks/useMessages";
export function ConversationView({ matchConnectionId }: { matchConnectionId: string }) { const {data=[],isLoading}=useMatchMessages(matchConnectionId);const send=useSendMatchMessage(matchConnectionId);const [body,setBody]=useState("");const valid=!!body.trim()&&body.length<=1000;return <div className="flex h-full flex-col gap-3"><div className="flex-1 space-y-2">{isLoading?"جارٍ التحميل":data.map(m=><p key={m.id} className={m.isMine?"ms-auto w-fit rounded-card bg-primary p-3 text-white":"me-auto w-fit rounded-card bg-surface p-3"}>{m.body}</p>)}</div><textarea value={body} maxLength={1000} onChange={e=>setBody(e.target.value)} /><Button disabled={!valid||send.isPending} onClick={()=>send.mutate({body:body.trim()},{onSuccess:()=>setBody("")})}>إرسال</Button></div>; }
