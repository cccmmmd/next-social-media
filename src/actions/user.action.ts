"use server";

import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function syncUser() {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) return;

        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId,
            },
        });

        if (existingUser) return existingUser;
        const dbUser = await prisma.user.create({
            data: {
                clerkId: userId,
                name: `${user.firstName || ""} ${user.lastName || ""}`,
                username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                email: user.emailAddresses[0].emailAddress,
                image: user.imageUrl,
            },
        });

        return dbUser;
    } catch (error) {
        console.log("Error in syncUser", error);
    }
}

export async function getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({
        where: {
            clerkId,
        },
        include: {
            _count: {
            select: {
                followers: true,
                following: true,
                posts: true,
            },
            },
        },
    });
}

export async function getDbUserId() {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) return null;
   
    const user = await getUserByClerkId(clerkId);
  
    if (!user) throw new Error("沒有找到使用者");
  
    return user.id;
}
  
export async function getRandomUsers() {
try {
    const userId = await getDbUserId();

    if (!userId) return [];

    // get 3 random users exclude ourselves & users that we already follow
    const randomUsers = await prisma.user.findMany({
    where: {
        AND: [
        { NOT: { id: userId } },
        {
            NOT: {
            followers: {
                some: {
                followerId: userId,
                },
            },
            },
        },
        ],
    },
    select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
        select: {
            followers: true,
        },
        },
    },
    take: 3,
    });

    return randomUsers;
} catch (error) {
    console.log("Error fetching random users", error);
    return [];
}
}

export async function toggleFollow(targetUserId: string) {
    try {
        const userId = await getDbUserId();
  
        if (!userId) return;
  
       if (userId === targetUserId) throw new Error("You cannot follow yourself");
  
        const existingFollow = await prisma.follows.findUnique({
            where: {
            followerId_followingId: {
                followerId: userId,
                followingId: targetUserId,
            },
            },
        });
  
        if (existingFollow) {
            // unfollow
            await prisma.follows.delete({
                where: {
                    followerId_followingId: {
                    followerId: userId,
                    followingId: targetUserId,
                    },
                },
            });
        } else {
            // follow
            await prisma.$transaction([     // 如果任何一個操作失敗，所有操作都會被回滾，確保多個數據庫操作要麼全部成功，要麼全部失敗
                prisma.follows.create({
                    data: {
                    followerId: userId,
                    followingId: targetUserId,
                    },
                }),
    
                prisma.notification.create({
                    data: {
                    type: "FOLLOW",
                    userId: targetUserId, // 我追蹤的人
                    creatorId: userId, // 我
                    },
                }),
            ]);
        }
  
        revalidatePath("/");  // 清除快取
        return { success: true };
    } catch (error) {
        console.log("Error in toggleFollow", error);
        return { success: false, error: "Error toggling follow" };
    }
  }