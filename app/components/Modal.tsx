"use client";

import React, { Fragment, PropsWithChildren } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export type ModalProps = {
  open: boolean;
  onClose: (open: boolean) => void;
  title?: string;
  className?: string;
};

export default function Modal({ open, onClose, title, className, children }: PropsWithChildren<ModalProps>) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => onClose(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-2 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-2 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={
                `w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-neutral-900 ${className ?? ""}`
              }>
                <div className="flex items-start justify-between gap-4">
                  {title ? (
                    <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {title}
                    </Dialog.Title>
                  ) : (
                    <span className="sr-only">Modal</span>
                  )}
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-400 dark:hover:bg-neutral-800 dark:hover:text-gray-200"
                    onClick={() => onClose(false)}
                    aria-label="Close"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 text-gray-700 dark:text-gray-200">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
