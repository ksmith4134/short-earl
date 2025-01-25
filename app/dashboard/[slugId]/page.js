import DashboardNav from "@/components/DashboardNav";
import { getUrlStats } from "@/server/actions";

export default async function URLStatsPage({ params }) {



  const result = await getUrlStats((await params).slugId);

  console.log('RESULT', result);

  if (!result.success) {
    return (
      <p className="relative mx-auto w-full max-w-4xl text-center">
        {result.message}
      </p>
    );
  }

  return (
    <div className="w-full p-8 sm:p-16 max-w-3xl">
      <DashboardNav />
      <div className="mt-8">
        {result.body.logs.map(log => (
          <div key={log.logging_id}>
            {log.browser}
          </div>
        ))}
      </div>
    </div>
  );
}
