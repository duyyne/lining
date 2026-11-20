export enum OrderStatus {
  Pending = 'pending',
  Shipping = 'shipping',
  Completed = 'completed',
  Canceled = 'canceled',
}
// order-status.enum.ts (đổi tên cho khớp enum của bạn)
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.Pending]: [OrderStatus.Shipping, OrderStatus.Canceled],
  [OrderStatus.Shipping]: [OrderStatus.Completed, OrderStatus.Canceled],
  [OrderStatus.Completed]: [],
  [OrderStatus.Canceled]: [],
};
