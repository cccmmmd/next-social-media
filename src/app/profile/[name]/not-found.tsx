import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HomeIcon, ArrowLeftIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] grid place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* 大 404  */}
            <p className="text-8xl font-bold text-primary font-mono">404</p>

            {/* Subtitle */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">未找到使用者</h1>
              <p className="text-muted-foreground">你找的使用者不存在</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="default" asChild>
                <Link href="/">
                  <HomeIcon className="mr-2 size-4" />
                  回 Home
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}