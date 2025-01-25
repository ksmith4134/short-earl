'use client';

import { useSearchParams } from "next/navigation";

export default function DashboardNav() {

  const searchParams = useSearchParams(); 
  const url = searchParams.get('url');
  const email = searchParams.get('email');

  return (
    <div>
      <p>{email}</p>
      <p>{url}</p>
    </div>
  )
}
