import type { DomainEvent } from "@/shared/events";

// In-process event bus. Events are lost if the process crashes mid-handling (see ADR 0001).
type Handler<E extends DomainEvent> = (event: E) => void | Promise<void>;
type EventOf<T extends DomainEvent["type"]> = Extract<DomainEvent, { type: T }>;

const handlers = new Map<DomainEvent["type"], Handler<DomainEvent>[]>();

export function subscribe<T extends DomainEvent["type"]>(type: T, handler: Handler<EventOf<T>>) {
  handlers.set(type, [...(handlers.get(type) ?? []), handler as Handler<DomainEvent>]);
}

export async function publish(event: DomainEvent) {
  for (const handler of handlers.get(event.type) ?? []) await handler(event);
}
