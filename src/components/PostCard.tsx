"use client";

import { createComment, deletePost, getPosts, toggleLike } from "@/actions/post.action";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { DeleteAlertDialog } from "./DeleteAlertDialog";

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

function PostCard({ post, dbUserId }: { post: Post; dbUserId: string | null }) {
    const { user } = useUser(); // 獲取當前使用者資料
    const [newComment, setNewComment] = useState(""); // 管理新評論的內容
    const [isCommenting, setIsCommenting] = useState(false); // 當前是否正在送出評論
    const [isLiking, setIsLiking] = useState(false); // 當前是否正在點讚
    const [isDeleting, setIsDeleting] = useState(false); // 當前是否正在刪除貼文
    const [hasLiked, setHasLiked] = useState(post.likes.some((like) => like.userId === dbUserId));   // 確認用戶是否已經按讚
    const [optimisticLikes, setOptmisticLikes] = useState(post._count.likes); // 管理按讚數量
    const [showComments, setShowComments] = useState(false);  // 控制評論顯示

    const handleLike = async () => {
        if (isLiking) return;  // 如果正在處理按讚請求，則不執行
        try {
            setIsLiking(true); // 設置處理中狀態
            setHasLiked((prev) => !prev); // 立即更新按讚狀態（樂觀更新）
            setOptmisticLikes((prev) => prev + (hasLiked ? -1 : 1)); // 更新按讚數量（樂觀更新）
            await toggleLike(post.id); // 向服務器發送按讚請求
        } catch (error) {
            setOptmisticLikes(post._count.likes);
            setHasLiked(post.likes.some((like) => like.userId === dbUserId));
        } finally {
            setIsLiking(false);  // 完成處理
        }
    };
    const handleAddComment = async () => {
        if (!newComment.trim() || isCommenting) return;
        try {
            setIsCommenting(true);
            const result = await createComment(post.id, newComment);
            if (result?.success) {
                toast.success("評論發布成功");
                setNewComment("");
            }
        } catch (error) {
            toast.error("新增評論失敗");
        } finally {
            setIsCommenting(false);
        }
    };
    const handleDeletePost = async () => {
        if (isDeleting) return;
        try {
            setIsDeleting(true);
            const result = await deletePost(post.id);
            if (result.success) toast.success("貼文刪除成功");
            else throw new Error(result.error);
        } catch (error) {
            toast.error("刪除貼文失敗");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                <div className="flex space-x-3 sm:space-x-4">
                    <Link href={`/profile/${post.author.username}`}>
                    <Avatar className="size-8 sm:w-10 sm:h-10">
                        <AvatarImage src={post.author.image ?? "/avatar.png"} />
                    </Avatar>
                    </Link>

                    {/* 貼文標題和內文內容*/}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                            <Link
                                href={`/profile/${post.author.username}`}
                                className="font-semibold truncate"
                            >
                                {post.author.name}
                            </Link>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Link href={`/profile/${post.author.username}`}>@{post.author.username}</Link>
                                <span>•</span>
                                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                            </div>
                            </div>
                            {/* 查看當前使用者是否是貼文的作者，如果是就可刪 */}
                            {dbUserId === post.author.id && (   
                                <DeleteAlertDialog isDeleting={isDeleting} onDelete={handleDeletePost} />
                            )}
                        </div>
                        <p className="mt-2 text-sm text-foreground break-words">{post.content}</p>
                    </div>
                </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default PostCard