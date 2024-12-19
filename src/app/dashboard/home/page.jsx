import HomeDash from "@/app/ui/home/home-page";
import { auth } from "@/app/auth";

export default async function HomePage() {
  const session = await auth();
  return <div>{session?.user && <HomeDash />}</div>;
}
