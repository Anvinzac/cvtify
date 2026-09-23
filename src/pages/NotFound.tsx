import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow mb-4">Error 404</p>
      <h1 className="font-display text-6xl font-semibold leading-none sm:text-8xl">Lost the frame</h1>
      <p className="mt-4 max-w-sm text-muted-foreground">
        This page isn't part of the story.
      </p>
      <Link
        to="/"
        className={cn(buttonVariants({ size: "lg" }), "gradient-warm mt-8 rounded-full px-6 text-primary-foreground shadow-elevated")}
      >
        Back to the CV
      </Link>
    </div>
  );
};

export default NotFound;
