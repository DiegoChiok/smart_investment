"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      //if (!user) {
      //  router.push("/"); // back to welcome/login
      //}
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex flex-col my-5 mx-[170px] min-h-[150px] h-screen pt-5">
        <div className="">
            <ul className="flex items-center justify-center list-none gap-[60px] text-[20px]">
            <li>Portfolio</li>
            <li>Help</li>
            <li>Skills</li>
            <li>Projects</li>
            <li>Contact</li>
        </ul>
        </div>

        <div className="flex flex-col items-center justify-center text-6xl font-bold pt-5">
            <h1 className="">Dashboard</h1>
            <p>Welcome name!</p>
        </div>
    
    </div>
  );
}
