// Public API for the domain event system
export { emit, subscribe, queryEvents, getEventCount, resetEventBus } from './bus';
export type { EmitOptions, EventHandler } from './bus';
export type { DomainEvent, DomainEventType, DomainEventPayload } from './types';
export { registerDefaultHandlers } from './handlers';
