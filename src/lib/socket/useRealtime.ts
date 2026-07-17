"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "@/src/lib/api/contracts/notification";
import type { Notification, NotificationsResponse } from "@/src/lib/api/contracts/notification";
import type { AdminQueuesResponse, QueueItem } from "@/src/lib/api/contracts/admin";

/**
 * PRO-06 realtime client.
 *
 * Unlike every other call in this app, this one talks to the backend origin
 * directly rather than through the BFF proxy — a websocket can't be proxied
 * through a Route Handler. It carries no token: `withCredentials` lets the
 * browser attach the httpOnly cookie itself, so the "tokens never reach client
 * JS" rule holds (see src/mocks/socket.ts, ASSUMPTIONS.md #28).
 *
 * The socket is **delivery, not truth**. Every event is already persisted, so
 * the design spec's "degrade to polling" is honest here: if the socket is
 * down, the existing queries just poll and nothing is lost.
 */

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

let socket: Socket | null = null;

/** One shared connection per tab, regardless of how many components subscribe. */
function getSocket(): Socket | null {
  if (!SOCKET_URL || typeof window === "undefined") return null;
  socket ??= io(SOCKET_URL, {
    withCredentials: true,
    // A rejected handshake means "not signed in", which reconnecting won't fix
    // on its own — but a dropped connection should recover, so keep it modest.
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  return socket;
}

/* The connection is external state, so it's read through useSyncExternalStore
 * rather than mirrored into React state from an effect. That also makes the
 * "socket already connected before this component mounted" case just work. */

function subscribeToStatus(onChange: () => void): () => void {
  const s = getSocket();
  if (!s) return () => {};
  s.on("connect", onChange);
  s.on("disconnect", onChange);
  s.on("connect_error", onChange);
  return () => {
    s.off("connect", onChange);
    s.off("disconnect", onChange);
    s.off("connect_error", onChange);
  };
}

const getStatus = () => getSocket()?.connected ?? false;
/** SSR has no socket — render as "offline" so the markup matches first paint. */
const getServerStatus = () => false;

export interface RealtimeState {
  /** False → callers should keep polling (design spec: degrade, don't fail). */
  connected: boolean;
}

/**
 * Subscribes this tab to its realtime feed and keeps the React Query cache in
 * step. Mount once, high in the tree.
 */
export function useRealtime(): RealtimeState {
  const qc = useQueryClient();
  const connected = useSyncExternalStore(subscribeToStatus, getStatus, getServerStatus);

  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const onNotification = (n: Notification) => {
      // Push into the cache so the bell updates without a round trip. Ignore a
      // duplicate id: a reconnect can replay, and the bell must not double up.
      qc.setQueryData<NotificationsResponse>(["notifications"], (prev) => {
        if (!prev) return { items: [n], unread: 1 };
        if (prev.items.some((x) => x.id === n.id)) return prev;
        return { items: [n, ...prev.items].slice(0, 20), unread: prev.unread + 1 };
      });
    };

    const onQueueItem = (item: QueueItem) => {
      qc.setQueryData<AdminQueuesResponse>(["admin", "queues"], (prev) => {
        if (!prev) return prev;
        const key = `${item.type}Queue` as keyof AdminQueuesResponse;
        const existing = prev[key];
        if (existing.some((q) => q.id === item.id)) return prev;
        return { ...prev, [key]: [item, ...existing] };
      });
    };

    s.on(SOCKET_EVENTS.notification, onNotification);
    s.on(SOCKET_EVENTS.adminQueueItem, onQueueItem);
    return () => {
      s.off(SOCKET_EVENTS.notification, onNotification);
      s.off(SOCKET_EVENTS.adminQueueItem, onQueueItem);
    };
  }, [qc]);

  return { connected };
}
