"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { ImageIcon, Loader2Icon, SendIcon } from "lucide-react";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import { createPost } from "@/actions/post.action";


function CreatePost() {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;

    setIsPosting(true);
    try {
        const result = await createPost(content, imageUrl);
        if (result?.success) {   //如果 result 存在，則檢查它的 success 屬性值，如果 result 不存在，則整個表達式返回 undefined
            // reset form
            setContent("");
            setImageUrl("");
            setShowImageUpload(false);

            toast.success("貼文建立成功！");
        }
    } catch (error) {
        console.error("Failed to create post:", error);
        toast.error("貼文建立失敗！");
    } finally {
        setIsPosting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
            <div className="flex space-x-4">
                <Avatar className="w-10 h-10">
                <AvatarImage src={user?.imageUrl || "/avatar.png"} />
                </Avatar>
                <Textarea
                placeholder="內心在想什麼？ 寫下來..."
                className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-base"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isPosting}
                />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
                <div className="flex space-x-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => setShowImageUpload(!showImageUpload)}
                        disabled={isPosting}
                    >
                        <ImageIcon className="size-4 mr-2" />
                        照片
                    </Button>
                </div> 
                    <Button
                className="flex items-center"
                onClick={handleSubmit}
                disabled={(!content.trim() && !imageUrl) || isPosting}
                >
                {isPosting ? (
                    <>
                    <Loader2Icon className="size-4 mr-2 animate-spin" />
                    張貼中...
                    </>
                ) : (
                    <>
                    <SendIcon className="size-4 mr-2" />
                    送出
                    </>
                )}
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default CreatePost;