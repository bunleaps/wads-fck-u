"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import withAuth from "@/components/withAuth"; // Import the HOC
import { getToken } from "@/utils/auth"; // To get token for API calls
import PurchasesTable from "@/components/PurchasesTable"; // Import user table component
import PurchasesTableAdmin from "@/components/PurchasesTableAdmin"; // Import admin table component

function PurchasesPage({ user }) {
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPurchases = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      setError("User information not available.");
      return;
    }

    setIsLoading(true);
    setError("");
    const token = getToken();
    if (!token) {
      setError("Authentication token not found.");
      setIsLoading(false);
      return;
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    let apiUrl = "";
    if (user.role === "admin") {
      apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/purchases`;
    } else if (user.role === "user") {
      apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/purchases/user`;
    } else {
      setError("Invalid user role for fetching purchases.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(apiUrl, config);
      setPurchases(response.data.purchases || response.data || []);
    } catch (err) {
      console.error(`Error fetching ${user.role} purchases:`, err);
      setError(err.response?.data?.message || "Failed to load purchases.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  if (isLoading)
    return <div className="p-4 text-center">Loading purchases...</div>;
  if (error)
    return <div className="p-4 text-red-500 text-center">Error: {error}</div>;
  if (!user)
    // Should be handled by withAuth, but as a fallback
    return <div className="p-4 text-center">User not found.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Purchases {user.role === "admin" ? "(Admin View)" : "(My Purchases)"}
      </h1>
      {purchases.length === 0 && !isLoading && (
        <p className="text-center text-gray-500">
          {user.role === "admin"
            ? "No purchases found."
            : "You have no purchases yet."}
        </p>
      )}
      {purchases.length > 0 && (
        <>
          {user.role === "admin" ? (
            <PurchasesTableAdmin
              purchases={purchases}
              onPurchaseUpdated={fetchPurchases}
            />
          ) : (
            <PurchasesTable purchases={purchases} />
          )}
        </>
      )}
    </div>
  );
}

export default withAuth(PurchasesPage, ["admin", "user"]); // Allow both admin and user to see their purchases
