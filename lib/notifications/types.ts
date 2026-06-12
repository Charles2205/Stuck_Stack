export type BoardNotificationKind = "stuck-too" | "help-offer";

export type BoardNotification = {
  id: string;
  kind: BoardNotificationKind;
  blockerId: string;
  blockerTitle: string;
  message: string;
};

export type BoardToast = BoardNotification & {
  createdAt: number;
};
