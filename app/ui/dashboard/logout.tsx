'use client';

import { signout } from '@/app/lib/actions';
import { PowerIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { AuthError } from 'next-auth';
import React, { useTransition } from 'react';

export const Logout = () => {
  const [isPending, startTransition] = useTransition();
  const handleSignout = async () => {
    startTransition(async () => {
      await signout();
    });
  };
  return (
    <button
      className={clsx(
        'flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
        {
          'animate-pulse': isPending,
        },
      )}
      onClick={handleSignout}
      aria-disabled={isPending}
    >
      <PowerIcon className="w-6" />
      <div className="hidden md:block">Sign Out</div>
    </button>
  );
};
