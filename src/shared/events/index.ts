// Domain event contracts. Publishers and consumers import these types, never each other.

export type UserRegistered = {
  type: "UserRegistered";
  payload: { userId: string; role: "CLIENT" | "BEEKEEPER" };
  occurredAt: Date;
};

export type DomainEvent = UserRegistered;
