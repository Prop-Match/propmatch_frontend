"use client";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { EmptyState, ErrorState } from "@/src/components/ui/States";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { useMatchConversations } from "../hooks/useMessages";
export function ConversationList({role}:{role:"tenant"|"landlord"}) { const q=useMatchConversations(); if(q.isError)return <ErrorState onRetry={()=>q.refetch()}/>;if(q.isLoading)return <Skeleton className="h-28 w-full"/>;if(!q.data?.length)return <EmptyState Icon={MessageCircle} title="لا توجد محادثات حتى الآن"/>;return <div className="flex flex-col gap-3">{q.data.map(c=><Link key={c.matchConnectionId} href={`/${role}/messages/${c.matchConnectionId}`} className="rounded-card border border-hairline bg-surface p-4"><p className="font-bold">{c.propertyTitle}</p><p className="text-small text-muted">{c.otherParticipantName}</p><p className="text-small">{c.lastMessagePreview ?? "ابدأ المحادثة"}</p></Link>)}</div>; }
