"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";

export async function createPost(content: string, image: string) {
    try {
      const userId = await getDbUserId();
  
      if (!userId) return;
  
      const post = await prisma.post.create({
        data: {
			content,
			image,
			authorId: userId,
        },
      });
  
      revalidatePath("/"); // 清除快取，Next.js 重新驗證首頁的數據
      return { success: true, post };
    } catch (error) {
		console.error("Failed to create post:", error);
		return { success: false, error: "Failed to create post" };
    }
}

export async function getPosts() {
	try {
		const posts = await prisma.post.findMany({
			orderBy: {
			  createdAt: "desc",
			},
				include: {
				author: {
					select: {
					id: true,
					name: true,
					image: true,
					username: true,
					},
				},
				comments: {
					include: {
					author: {
						select: {
						id: true,
						username: true,
						image: true,
						name: true,
						},
					},
					},
					orderBy: {
					createdAt: "asc",
					},
				},
				likes: {
					select: {
					userId: true,
					},
				},
				_count: {
					select: {
					likes: true,
					comments: true,
					},
				},
			},
		});
	  
		return posts;
	} catch (error) {
		console.log("Error in getPosts", error);
		throw new Error("Failed to fetch posts");
	}
}

export async function toggleLike(postId: string) {
	try {
		const userId = await getDbUserId();
		if (!userId) return;
  
		// 檢查該用戶是否已經點讚過這個貼文
		const existingLike = await prisma.like.findUnique({
			where: {
			userId_postId: {
				userId,
				postId,
			},
			},
		});
  
		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { authorId: true },
		});
  
	  	if (!post) throw new Error("Post not found");
  
		if (existingLike) {
			// unlike 貼文
			await prisma.like.delete({
			where: {
				userId_postId: {
				userId,
				postId,
				},
			},
			});
		} else {
			// 如果還沒點讚，就創建新的點讚，並可能需要創建通知
			await prisma.$transaction([
			prisma.like.create({
				data: {
				userId,
				postId,
				},
			}),
			...(post.authorId !== userId
				? [
					prisma.notification.create({
					data: {
						type: "LIKE",
						userId: post.authorId, // 通知接收者（貼文作者）
						creatorId: userId, // 點讚的人
						postId,
					},
					}),
				]
				: []),
			]);
		}
  
		revalidatePath("/");  // 清除快取
		return { success: true };
	} catch (error) {
		console.error("Failed to toggle like:", error);
		return { success: false, error: "Failed to toggle like" };
	}
}

export async function createComment(postId: string, content: string) {
	try {
		const userId = await getDbUserId();
	
		if (!userId) return;
		if (!content) throw new Error("內容為必填項");
	
		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { authorId: true },
		});
  
	  	if (!post) throw new Error("Post not found");
  
		// 在 transaction 中建立評論和通知
		const [comment] = await prisma.$transaction(async (tx) => {
			// 先建立評論
			const newComment = await tx.comment.create({
			data: {
				content,
				authorId: userId,
				postId,
			},
		});
	
		// 如果評論別人的貼文則建立通知
		if (post.authorId !== userId) {
			await tx.notification.create({
				data: {
				type: "COMMENT",
				userId: post.authorId,
				creatorId: userId,
				postId,
				commentId: newComment.id,
				},
			});
		}
  
		return [newComment];
	  });
  
	  revalidatePath(`/`);
	  	return { success: true, comment };
	} catch (error) {
		console.error("Failed to create comment:", error);
		return { success: false, error: "Failed to create comment" };
	}
}

export async function deletePost(postId: string) {
	try {
		const userId = await getDbUserId();
	
		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { authorId: true },
		});
	
		if (!post) throw new Error("找不到貼文");
		if (post.authorId !== userId) throw new Error("未經授權-無刪除權限");
	
		await prisma.post.delete({
			where: { id: postId },
		});
	 
		revalidatePath("/"); // 清除快取
		return { success: true };
	} catch (error) {
		console.error("Failed to delete post:", error);
		return { success: false, error: "Failed to delete post" };
	}
}