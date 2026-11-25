export enum OrderStatus {
  Pending = 'pending',
  Paid = 'paid',
  Shipping = 'shipping',
  Completed = 'completed',
  Canceled = 'canceled',
}

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.Pending]: [OrderStatus.Paid, OrderStatus.Canceled],
  [OrderStatus.Paid]: [OrderStatus.Shipping, OrderStatus.Canceled],
  [OrderStatus.Shipping]: [OrderStatus.Completed],
  [OrderStatus.Completed]: [],
  [OrderStatus.Canceled]: [],
};
