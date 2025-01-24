import {
    getProfileByUsername,
    getUserLikedPosts,
    getUserPosts,
    isFollowing,
  } from "@/actions/profile.action";
  import { notFound } from "next/navigation";
  import ProfilePageClient from "./ProfilePageClient";
  
  export async function generateMetadata({ params }: { params: { name: string } }) {
    const user = await getProfileByUsername(params.name);
    if (!user) return;
  
    return {
      title: `${user.name ?? user.name}`,
      description: user.bio || `Check out ${user.name}'s profile.`,
    };
  }
  
  async function ProfilePageServer({ params }: { params: { name: string } }) {
    const user = await getProfileByUsername(params.name);
  
    if (!user) notFound();
  
    const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
      getUserPosts(user.id),
      getUserLikedPosts(user.id),
      isFollowing(user.id),
    ]);
  
    return (
      <ProfilePageClient
        user={user}
        posts={posts}
        likedPosts={likedPosts}
        isFollowing={isCurrentUserFollowing}
      />
    );
  }
  export default ProfilePageServer;