'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { HiMagnifyingGlass } from "react-icons/hi2";

export const emailFormState = {
  success: false,
  message: '',
  errors: {
    email: [],
  },
};

export default function SearchForm() {

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('email', term);
    } else {
      params.delete('email');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 500);

  return (
    <div className="mt-8 relative flex flex-1 flex-shrink-0">
      <label htmlFor="email" className="sr-only">Search by Email</label>
      <input 
        type="email" 
        id="email"
        name="email"
        placeholder="Search by email" 
        autoComplete='email' 
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
        className="form-input rounded-lg border border-gray-300 py-3 text-sm shadow shadow-gray-100 peer block w-full pl-10 outline-2 placeholder:text-gray-500" 
      />
      <HiMagnifyingGlass className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  )
}
