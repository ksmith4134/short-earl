import Link from "next/link";
import { getAllUserUrls } from "@/server/actions";
import SearchForm from "@/components/SearchForm";
import { FaArrowRight } from "react-icons/fa6";

export default async function Search(props) {

  const searchParams = await props.searchParams;
  const email = searchParams?.email || '';

  const allUserUrls = await getAllUserUrls(email);

  return (
    <div className="p-8 sm:p-16 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-sm">
        <Link href="/" className="text-blue-500 underline underline-offset-4">Home</Link>

        <h1 className="mt-8 text-3xl font-extrabold font-[family-name:var(--font-geist-mono)]">Search Earls</h1>
        <p className="mt-2 text-sm text-">Enter your email to see all of the associated URLs.<br />Click one of those URLs to see its statistics.</p>

        <SearchForm />

        <div className="mt-8 w-full">
          {allUserUrls?.map((url) => (
            <Link key={url.slug_id} href={`/search/${url.slug_id}?email=${email}&hash=${url.slug_hash}&url=${url.url}`} className="group">
              <div className="w-full border-b py-3 flex items-center justify-between group-hover:bg-gray-100">
                <p className="ml-4">{url.url}</p>
                <FaArrowRight className="shrink-0 mr-4 transition duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}