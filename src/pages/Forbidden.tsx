import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

const Forbidden = () => {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
      <div className="mb-6 rounded-full bg-destructive/10 p-6">
        <ShieldAlert className="h-16 w-16 text-destructive" />
      </div>
      <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Access Denied
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-md">
        You do not have the required permissions to view this page. Please contact an administrator or return to the dashboard.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild variant="outline">
          <Link to="/">Go Home</Link>
        </Button>
        <Button asChild>
          <Link to="/auth">Switch Account</Link>
        </Button>
      </div>
    </div>
  );
};

export default Forbidden;
