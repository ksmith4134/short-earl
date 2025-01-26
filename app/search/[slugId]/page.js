import { getUrlStats, getBrowserTotals, getOsTotals } from "@/server/actions";
import Link from "next/link";
import BarChart from "@/components/BarChart";
import { BROWSER_BAR_CHART, OS_BAR_CHART } from "@/lib/theme";

export default async function URLStatsPage(props) {

  const params = await props.params;
  const slugId = params?.slugId || '';

  const searchParams = await props.searchParams;
  const email = searchParams.email;
  const hash = searchParams.hash;
  const url = searchParams.url;

  const [totalClicks, browserTotals, osTotals] = await Promise.all([getUrlStats(slugId), getBrowserTotals(slugId), getOsTotals(slugId)])

  console.log('Totals', totalClicks);
  console.log('Browser Stats', browserTotals);
  console.log('OS Stats', osTotals);

  return (
    <main className="p-8 sm:p-16 font-[family-name:var(--font-geist-sans)] max-w-3xl">
      <div className="flex gap-4">
        <Link href={`/search?email=${email}`} className="text-blue-500 underline underline-offset-4">Back</Link>
        <Link href="/" className="text-blue-500 underline underline-offset-4">Home</Link>
      </div>

      <h1 className="mt-8 text-3xl font-extrabold font-[family-name:var(--font-geist-mono)]">Earl</h1>

      <div className="mt-8">
        <table className="table-auto">
          <tbody>
            <tr>
              <td className="font-bold w-24">Email </td>
              <td>{email}</td>
            </tr>
            <tr>
              <td className="font-bold">Real URL </td>
              <td>{url}</td>
            </tr>
            <tr>
              <td className="font-bold">Short URL </td>
              <td>{process.env.BASE_URL}/{hash}</td>
            </tr>
          </tbody>
        </table>

      </div>

      <div className="mt-8">
        <h2 className="font-bold">Total Clicks</h2>
        <p>{totalClicks[0].total}</p>
      </div>

      <div className="mt-8">
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
