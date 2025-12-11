import { Link } from "react-router-dom";
import { Home, ArrowLeft, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        {/* Illustration */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
              <Leaf className="h-16 w-16 text-primary animate-bounce-subtle" />
            </div>
            <div className="absolute -bottom-2 left-1/2 h-4 w-24 -translate-x-1/2 rounded-full bg-primary/10 blur-xl" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="font-display text-8xl font-bold text-primary md:text-9xl">404</h1>

        {/* Message */}
        <h2 className="mt-4 font-display text-2xl font-semibold md:text-3xl">
          Oops! Page not found
        </h2>
        <p className="mt-3 max-w-md text-muted-foreground">
          Looks like this crop didn't make it. The page you're looking for 
          doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link to="/">
            <Button size="lg" className="gap-2">
              <Home className="h-5 w-5" />
              Go to Home
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="gap-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12">
          <p className="text-sm text-muted-foreground">
            Or try these popular pages:
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Link to="/marketplace" className="text-sm font-medium text-primary hover:underline">
              Marketplace
            </Link>
            <Link to="/advisory" className="text-sm font-medium text-primary hover:underline">
              Advisory
            </Link>
            <Link to="/community" className="text-sm font-medium text-primary hover:underline">
              Community
            </Link>
            <Link to="/founders" className="text-sm font-medium text-primary hover:underline">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
