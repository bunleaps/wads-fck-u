import React from "react";

export default function PurchasesTable({ purchases }) {
  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3 font-semibold">Order Number</th>
            <th className="px-6 py-3 font-semibold">Items</th>
            <th className="px-6 py-3 font-semibold">Total Amount</th>
            <th className="px-6 py-3 font-semibold">Date</th>
            <th className="px-6 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase) => (
            <tr key={purchase._id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-600">
                {purchase.orderNumber}
              </td>
              <td className="px-4 py-2 text-gray-600">
                {purchase.items
                  .map((item) => item.name || item.itemName || "Unknown Item")
                  .join(", ")}{" "}
                ({purchase.items.length})
              </td>
              <td className="px-4 py-2 text-gray-600">
                ${purchase.totalAmount.toFixed(2)}
              </td>
              <td className="px-4 py-2 text-gray-600">
                {new Date(
                  purchase.purchaseDate || purchase.createdAt
                ).toLocaleDateString()}
              </td>
              <td className="px-4 py-2 text-gray-600">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    purchase.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {purchase.status
                    ? purchase.status.charAt(0).toUpperCase() +
                      purchase.status.slice(1)
                    : "Pending"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
