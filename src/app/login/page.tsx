import { redirect } from "next/navigation";
import { LoginForm } from "@/components/shared/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServerAuthSession } from "@/server/auth";

export default async function Login() {
  const session = await getServerAuthSession();
  const user = session?.user;
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl">Sign in</CardTitle>
          <CardDescription className="text-center">
            using one of the providers below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
