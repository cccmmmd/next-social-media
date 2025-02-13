"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteAlertDialogProps {
    isDeleting: boolean;
    onDelete: () => Promise<void>;
    title?: string;
    description?: string;
}

export function DeleteAlertDialog({
    isDeleting,
    onDelete,
    title = "刪除貼文",
    description = "確定嗎？這個動作無法逆轉",
}: DeleteAlertDialogProps) {
    return (
        <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-red-500 -mr-2"
            >
            {isDeleting ? (
                <Loader2Icon className="size-4 animate-spin" />
            ) : (
                <Trash2Icon className="size-4" />
            )}
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
                onClick={onDelete}
                className="bg-red-500 hover:bg-red-600"
                disabled={isDeleting}
            >
                {isDeleting ? "刪除中..." : "刪除"}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    );
}