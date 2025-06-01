import ticketsData from "@/lib/ticketsData";
import Link from "next/link";

export default function TicketPage({ params }) {
  const ticket = ticketsData.find((ticket) => ticket._id.$oid === params.id);

  if (!ticket) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-600">Ticket not found</h1>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Tickets
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{ticket.title}</h1>

          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">Status: {ticket.status}</span>
            <span className="text-gray-600">
              Created:{" "}
              {new Date(
                Number(ticket.createdAt.$date.$numberLong)
              ).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Messages</h2>
          {ticket.messages.map((message) => (
            <div key={message._id.$oid} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">From: {message.sender.$oid}</span>
                <span className="text-sm text-gray-500">
                  {new Date(
                    Number(message.createdAt.$date.$numberLong)
                  ).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700 mb-4">{message.content}</p>
              {message.attachments && message.attachments.length > 0 && (
                <div className="border-t pt-3">
                  <h3 className="text-sm font-semibold mb-2">Attachments:</h3>
                  <div className="flex gap-2">
                    {message.attachments.map((attachment) => (
                      <a
                        key={attachment._id.$oid}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {attachment.filename}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
