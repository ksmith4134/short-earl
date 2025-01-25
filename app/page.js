'use client';

import Link from "next/link";
import { useActionState, useState } from "react";
import { createSlugAction } from "@/server/actions";
import { SubmitButton, FormInputError } from "@/components/FormControls";

export const UrlFormState = {
  success: false,
  message: '',
  errors: {
    url: [],
    email: [],
  },
};

export default function Home() {

  const [state, dispatch, isPending] = useActionState(createSlugAction, UrlFormState);
  const [isCopied, setIsCopied] = useState(false);

  function copyToClipboard() {
    navigator.clipboard.writeText(state?.body.link)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
      });
  }

  return (
    <div className="p-8 sm:p-16 font-[family-name:var(--font-geist-sans)]">
      <main className="w-full max-w-sm">
        <Link href="/dashboard" className="text-blue-500 underline underline-offset-4">Dashboard</Link>
        <h1 className="mt-8 text-3xl font-extrabold font-[family-name:var(--font-geist-mono)]">Short Earl</h1>
        <p className="mt-2 text-sm text-">Enter a URL and click Submit to get your shortened URL.</p>
        <p className="mt-2 text-sm text-">Add your email to monitor click tracking and user device information. Statistics can be tracked on the <strong><Link href="/dashboard">Dashboard</Link></strong>.</p>
        <p className="mt-2 text-sm text-"></p>
        <form action={dispatch} className="mt-8 flex flex-col gap-2">

          <div className="flex w-full flex-col">
            <label htmlFor="url" className="mb-1 text-xs font-bold">URL</label>
            <input required type="url" id="url" name="url" placeholder="Enter your URL" className="form-input rounded-lg border border-gray-300 p-3 text-sm shadow shadow-gray-100" />
            <FormInputError errors={state?.errors?.url} />
          </div>

          <div className="flex w-full flex-col">
            <label htmlFor="email" className="mb-1 text-xs font-bold">Monitor Analytics Email</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" autoComplete='email' className="form-input rounded-lg border border-gray-300 p-3 text-sm shadow shadow-gray-100" />
            <FormInputError errors={state?.errors?.email} />
          </div>

          <SubmitButton isPending={isPending} />

          {state?.success && (
            <div onClick={() => copyToClipboard()} className="w-full bg-gray-200 p-4 rounded-lg cursor-pointer text-sm" dangerouslySetInnerHTML={{ __html: state?.message }}></div>
          )}

          {isCopied && (
            <p className="text-sm">Copied to your clipboard!</p>
          )}

        </form>

      </main>
    </div>
  );
}