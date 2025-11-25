"use client";

import React from "react";
import Modal from "../components/Modal";

export default function NewHereModalDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Open Info Popup
      </button>

      <Modal open={open} onClose={setOpen} title="Welcome to ESG Game">
        <p>
          This is a Headless UI powered modal. You can use it for tips, confirmations, or any popup content.
        </p>
      </Modal>
    </div>
  );
}
