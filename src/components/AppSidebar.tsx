import { useState } from "react";
import { Home, BarChart3, Bell, Phone } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface AppSidebarProps {}


export function AppSidebar({}: AppSidebarProps) {
  const { open } = useSidebar();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationContext();
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="My Patient Roster">
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `flex items-center gap-3 transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }`
                    }
                  >
                    <Home className="h-5 w-5 text-blue-600" />
                    {open && <span className="text-sm font-medium">My Patient Roster</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Assessor KPI Dashboard">
                  <NavLink
                    to="/assessor-kpi"
                    className={({ isActive }) =>
                      `flex items-center justify-between gap-3 transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }`
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <BarChart3 className="h-5 w-5 flex-shrink-0 text-cyan-600" />
                      {open && (
                        <span className="text-sm font-medium truncate">Assessor KPI Dashboard</span>
                      )}
                    </div>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
                  <PopoverTrigger asChild>
                    <SidebarMenuButton tooltip="Notifications" className="relative">
                      <div className="flex items-center gap-3 w-full">
                        <Bell className="h-5 w-5 text-purple-600" />
                        {open && <span className="text-sm font-medium">Notifications</span>}
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-auto h-5 min-w-[20px] px-1 text-xs">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Badge>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start" side="right">
                    <div className="flex items-center justify-between border-b p-4">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="h-8 text-xs"
                        >
                          Mark all read
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="h-[400px]">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No notifications
                        </div>
                      ) : (
                        <div className="divide-y">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => {
                                if (!notification.read) {
                                  markAsRead(notification.id);
                                }
                                if (notification.patientId) {
                                  navigate(`/patient/${notification.patientId}`);
                                }
                                setNotificationOpen(false);
                              }}
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
                                  <Phone className="h-4 w-4" />
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
                                  <p className="text-xs text-muted-foreground leading-tight">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
