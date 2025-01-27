import { getUrlStats, getBrowserTotals, getOsTotals } from "@/server/actions";
import Link from "next/link";
import BarChart from "@/components/BarChart";
import { BROWSER_BAR_CHART, OS_BAR_CHART } from "@/lib/theme";

export default async function URLStatsPage(props) {

  const params = await props.params;
  const slugId = params?.slugId || '';

  const searchParams = await props.searchParams;
  const email = searchParams.email;

  const [urlStats, browserTotals, osTotals] = await Promise.all([
    getUrlStats(slugId), 
    getBrowserTotals(slugId), 
    getOsTotals(slugId)
  ]);

  return (
    <main className="p-8 sm:p-16 font-[family-name:var(--font-geist-sans)] max-w-2xl">
      <div className="flex gap-4">
        <Link href={`/search?email=${email}`} className="text-blue-500 underline underline-offset-4">Back</Link>
        <Link href="/" className="text-blue-500 underline underline-offset-4">Home</Link>
      </div>

      <h1 className="mt-8 text-3xl font-extrabold font-[family-name:var(--font-geist-mono)]">This Earl</h1>

      <div className="mt-6 text-sm">
        <table className="table-auto border-collapse border border-slate-300 border-spacing-4">
          <tbody>
            <tr>
              <td className="font-bold w-32 text-right align-top border border-slate-300 p-2">Email</td>
              <td className="border border-slate-300 p-2">{email}</td>
            </tr>
            <tr>
              <td className="font-bold w-32 text-right align-top border border-slate-300 p-2">URL</td>
              <td className="border border-slate-300 p-2">{urlStats[0].url}</td>
            </tr>
            <tr>
              <td className="font-bold w-32 text-right align-top border border-slate-300 p-2">Earl</td>
              <td className="border border-slate-300 p-2">{process.env.BASE_URL}/{urlStats[0].slug_hash}</td>
            </tr>
            <tr>
              <td className="font-bold w-32 text-right align-top border border-slate-300 p-2">Total Clicks</td>
              <td className="border border-slate-300 p-2">{urlStats[0].total}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-12">
        <h2 className="font-bold">Browser Stats</h2>
        {browserTotals && (
          <div className="mt-4">
            <BarChart data={browserTotals} backgroundColor={BROWSER_BAR_CHART.backgroundColor} borderColor={BROWSER_BAR_CHART.borderColor} borderWidth={BROWSER_BAR_CHART.borderWidth} />
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-bold">OS Stats</h2>
        {osTotals && (
          <div className="mt-4">
            <BarChart data={osTotals} backgroundColor={OS_BAR_CHART.backgroundColor} borderColor={OS_BAR_CHART.borderColor} borderWidth={OS_BAR_CHART.borderWidth} />
          </div>
        )}
      </div>
    </main>
  );
}
