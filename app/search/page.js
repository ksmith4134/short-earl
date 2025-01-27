import Link from "next/link";
import { getAllUserUrls } from "@/server/actions";
import SearchForm from "@/components/SearchForm";
import { FiBarChart } from "react-icons/fi";

export default async function Search(props) {

  const searchParams = await props.searchParams;
  const email = searchParams?.email || '';

  const allUserUrls = await getAllUserUrls(email);

  return (
    <main className="p-8 sm:p-16 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-blue-500 underline underline-offset-4">Home</Link>

        <h1 className="mt-8 text-3xl font-extrabold font-[family-name:var(--font-geist-mono)]">Search Earls</h1>
        <p className="mt-4 text-md">Enter your email to see all of the associated URLs.<br />Click on a URL to view its statistics.</p>

        <SearchForm />

        {allUserUrls.length === 0 && (
          <p className="mt-12 text-sm">No results</p>
        )}

        <div className="mt-8 w-full flex flex-col border-t">
          {allUserUrls?.map((url) => (
            <Link key={url.slug_id} href={`/search/${url.slug_id}?email=${email}`} className="group">
              <div className="w-full border-b px-3 py-4 flex items-center justify-between gap-4 group-hover:bg-gray-100">
                <div className="flex-1 w-16">
                  <p className="text-sm break-words">{url.url}</p>
                </div>
                <div className="flex-none">
                  <FiBarChart className="text-lg transition duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}