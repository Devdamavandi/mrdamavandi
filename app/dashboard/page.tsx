



import { auth } from "@/auth";
import {prisma} from "@/lib/db";
import { redirect } from "next/navigation";
import DashboardPageAdmin from "@/components/DashboardPageAdmin"; // rename your current dashboard to this
import CustomerDashboardPage from "@/components/customer/CustomerDashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user.email) {
    redirect("/auth/login");
  }

  // Fetch the latest user from the DB
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (user?.role === "CUSTOMER") {
    return <CustomerDashboardPage/>
  }

  // Render the client dashboard
  return <DashboardPageAdmin />;
}