"use client";

import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Fragment } from "react";
import clsx from "clsx";
import { cn } from "@fastform/lib/cn";

type Modal = {
  open: boolean;
  setOpen: (v: boolean) => void;
  children: React.ReactNode;
  title?: string;
  noPadding?: boolean;
  blur?: boolean;
  closeOnOutsideClick?: boolean;
};

export const Modal: React.FC<Modal> = ({
  open,
  setOpen,
  children,
  title,
  noPadding,
  blur = true,
  closeOnOutsideClick = true,
}) => {
  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-20" onClose={() => closeOnOutsideClick && setOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <div
              className={cn(
                blur && "backdrop-blur-md",
                "fixed inset-0 bg-slate-500 bg-opacity-30 transition-opacity"
              )}
            />
          </Transition.Child>

          <div className="fixed inset-0 z-10 mt-24 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                <Dialog.Panel
                  className={clsx(
                    "relative transform rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl ",
                    `${noPadding ? "" : "px-4 pb-4 pt-5 sm:p-6"}`
                  )}>
                  <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                    <button
                      type="button"
                      className="rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-0 focus:ring-offset-2"
                      onClick={() => setOpen(false)}>
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  {title && <h3 className="mb-4 text-xl font-bold text-slate-500">{title}</h3>}

                  {children}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};
