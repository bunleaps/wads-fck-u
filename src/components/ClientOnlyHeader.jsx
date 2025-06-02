"use client";

import { useState, useEffect } from "react";
import Header from "./templates/Header"; // Adjust path if necessary

export default function ClientOnlyHeader({ userInfo }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Or a static placeholder if you prefer
  }

  return <Header userInfo={userInfo} />;
}
