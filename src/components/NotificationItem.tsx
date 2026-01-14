import React from "react";
import { Phone, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();

  const handleClick = async () => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // If this notification is about a call, navigate to the patient page
    if (notification.call_id && notification.type === 'call_completed') {
      // We would need to look up the patient_id from the call
      // For now, just mark as read
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'call_completed':
        return <Phone className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-4 cursor-pointer hover:bg-accent transition-colors",
        !notification.read && "bg-accent/50"
      )}
    >
      <div className="flex gap-3">
        <div className={cn(
          "mt-0.5 rounded-full p-2",
          notification.read ? "bg-muted" : "bg-primary/10 text-primary"
        )}>
          {getIcon()}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className={cn(
              "text-sm leading-tight",
              !notification.read && "font-semibold"
            )}>
              {notification.title}
            </p>
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-primary mt-1 flex-shrink-0" />
            )}
          </div>
          {notification.message && (
            <p className="text-xs text-muted-foreground leading-tight">
              {notification.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}
