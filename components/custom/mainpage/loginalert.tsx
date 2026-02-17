"use client";

import { useEffect } from "react";
import { toast } from "sonner";

// alert component that tells user to login to tell server to continuosly track your flight
// didnt know whether to add or not

const VISIT_KEY = "site-visit-count";
const SHOW_EVERY = 5;

export function LoginReminderToast({ isAuthenticated }: { isAuthenticated: boolean }) {
  useEffect(() => {
    if (isAuthenticated) return;

    const currentCount = Number(localStorage.getItem(VISIT_KEY) || 0);
    const newCount = currentCount + 1;

    localStorage.setItem(VISIT_KEY, newCount.toString());

    if (newCount % SHOW_EVERY === 0) {
      toast("Login to track your flight", {
        description: "Sign in to save and track flights in real time.",
        action: {
          label: "Login",
          onClick: () => {
            window.location.href = "/login";
          },
        },
      });
    }
  }, [isAuthenticated]);

  return null;
}
