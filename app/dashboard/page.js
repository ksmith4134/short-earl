'use client';

import Link from "next/link";
import { useActionState } from "react";
import { getAllUserUrlsAction } from "@/server/actions";
import { FaArrowRight } from "react-icons/fa6";
import { SubmitButton, FormInputError } from "@/components/FormControls";


export const emailFormState = {
  success: false,
  message: '',
  errors: {
    email: [],
  },
};

export default function Dashboard() {

  const [state, dispatch, isPending] = useActionState(getAllUserUrlsAction, emailFormState);

  return (
    <div className="p-8 sm:p-16 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-sm">
        <Link href="/" className="text-blue-500 underline underline-offset-4">Home</Link>

        <h1 className="mt-8 text-3xl font-extrabold font-[family-name:var(--font-geist-mono)]">Short Earl</h1>
        <p className="mt-2 text-sm text-">Enter your email to see all of the associated URLs.<br />Click one of those URLs to see its statistics.</p>

        <form action={dispatch} className="mt-8 flex flex-col gap-3">

          <div className="flex w-full flex-col">
            <label htmlFor="email" className="mb-1 text-xs font-bold">Search by Email</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" autoComplete='email' className="form-input rounded-lg border border-gray-300 p-3 text-sm shadow shadow-gray-100" />
          </div>

          <SubmitButton isPending={isPending} label='Search' />
          <FormInputError errors={state?.errors?.email} />

          <h2 className="text-xl">Results</h2>

          {state?.success && (
            <div className="w-full">
              {state?.body?.urls.map((url) => (
                <Link key={url.slug_id} href={`/dashboard/${url.slug_id}?email=${state?.body?.email}&url=${url.url}`} className="group">
                  <div className="w-full border-b py-3 flex items-center justify-between group-hover:bg-gray-100">
                    <p className="ml-4">{url.url}</p>
                    <FaArrowRight className="shrink-0 mr-4 transition duration-300 group-hover:translate-x-1" />
                  </div>
                </Link>

              ))}
            </div>
          )}
        </form>

      </main>
    </div>
  );
}