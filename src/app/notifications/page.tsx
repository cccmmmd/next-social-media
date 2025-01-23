"use client";

import { getNotifications, markNotificationsAsRead } from "@/actions/notificatoin.action";
import { NotificationsSkeleton } from "@/components/NotificationSkeleton";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, MessageCircleIcon, UserPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";

import toast from "react-hot-toast";

type Notifications = Awaited<ReturnType<typeof getNotifications>>;
type Notification = Notifications[number];

const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return <HeartIcon className="size-4 text-red-500" />;
      case "COMMENT":
        return <MessageCircleIcon className="size-4 text-blue-500" />;
      case "FOLLOW":
        return <UserPlusIcon className="size-4 text-green-500" />;
      default:
        return null;
    }
};
  

function NotificationPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(()=> {
        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const data = await getNotifications();
                setNotifications(data);
                
                // 只保留 read 為 false 的元素（也就是未讀的通知）
                // 將每個通知物件轉換為它的 id 值，最終得到一個只包含 id 的陣列
                const unreadIds = data.filter((n) => !n.read).map((n) => n.id);  
                
                if (unreadIds.length > 0) await markNotificationsAsRead(unreadIds);
            } catch (error) {
              toast.error("Failed to fetch notifications");
            } finally {
              setIsLoading(false);
            }
        };
      
          fetchNotifications();
    },[])

    if (isLoading) return <NotificationsSkeleton />;

    return (
        <div className="space-y-4">
        <Card>
            <CardHeader className="border-b">
            <div className="flex items-center justify-between">
                <CardTitle>通知</CardTitle>
                <span className="text-sm text-muted-foreground">
                {notifications.filter((n) => !n.read).length} 未讀
                </span>
            </div>
            </CardHeader>
            <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-12rem)]">
                {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">還沒有任何通知</div>
                ) : (
                notifications.map((notification) => (
                    <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 border-b hover:bg-muted/25 transition-colors ${
                        !notification.read ? "bg-muted/50" : ""
                    }`}
                    >
                    <Avatar className="mt-1">
                        <AvatarImage src={notification.creator.image ?? "/avatar.png"} />
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <span>
                            <span className="font-medium">
                            {notification.creator.name ?? notification.creator.username}
                            </span>{" "}
                            {notification.type === "FOLLOW"
                            ? "開始追蹤你"
                            : notification.type === "LIKE"
                            ? "喜歡你的貼文"
                            : "在你的貼文留言"}
                        </span>
                        </div>

                        {notification.post &&
                        (notification.type === "LIKE" || notification.type === "COMMENT") && (
                            <div className="pl-6 space-y-2">
                            <div className="text-sm text-muted-foreground rounded-md p-2 bg-muted/30 mt-2">
                                <p>{notification.post.content}</p>
                                {notification.post.image && (
                                <img
                                    src={notification.post.image}
                                    alt="Post content"
                                    className="mt-2 rounded-md w-full max-w-[200px] h-auto object-cover"
                                />
                                )}
                            </div>

                            {notification.type === "COMMENT" && notification.comment && (
                                <div className="text-sm p-2 bg-accent/50 rounded-md">
                                {notification.comment.content}
                                </div>
                            )}
                            </div>
                        )}

                        <p className="text-sm text-muted-foreground pl-6">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                    </div>
                ))
                )}
            </ScrollArea>
            </CardContent>
        </Card>
        </div>
    );
}

export default NotificationPage