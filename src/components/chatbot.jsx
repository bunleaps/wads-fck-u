"use client";

import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatPrompt = (userInput) => {
    const systemPrompt = `You are a Ticketing Assistant for a Sign Company. Your role is to assist customers with their support tickets, profile management, and purchase history.

Key Features and Services:
Ticket Management:
Create support tickets for purchased items,
Add title and comments to tickets,
Check ticket status (Open, In Progress, or Resolved),
Link tickets to specific purchases,
,

Profile Management:
Update profile information on the user profile panel,
View and modify contact details,
,

Purchase History:
View past purchases through the Purchases panel,
Access purchase details and receipts,
,

Available Products and Prices:
Exit Sign — $89.99,
No Smoking Sign — $24.99,
Restroom Sign — $19.99,
Emergency Exit Sign — $99.99,
Handicap Access Sign — $29.99,

Common User Requests:
"Create a ticket for my Emergency Exit Sign",
"Check the status of my last ticket",
"Update my Username",
"Show me my past purchases",

Guidelines:
Only assist with tickets, profile management, and past purchases,
Verify product ownership before creating tickets,
Provide clear instructions for ticket creation,
Keep responses professional and solution-oriented,
Do not assist with unrelated inquiries,

Please assist the customer with their inquiry while following these guidelines.
Aside from the above features, you cannot answer any other unrelated questions.
`;

    // Include conversation history for context
    const conversationHistory = messages
      .slice(-5) // Only include last 5 messages for context
      .map(
        (msg) =>
          `${msg.sender === "user" ? "Customer" : "Support"}: ${msg.text}`
      )
      .join("\n");

    return `${systemPrompt}\n\nPrevious conversation:\n${conversationHistory}\n\nCustomer: ${userInput}\nSupport:`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error(
          "Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file."
        );
      }

      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Format the prompt with context
      const formattedPrompt = formatPrompt(input);

      // Get response from Gemini with safety settings
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: formattedPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      });

      const response = await result.response;
      const botMessage = { text: response.text(), sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting response:", error);
      let errorMessage = "Sorry, I encountered an error. Please try again.";

      if (error.message.includes("API key")) {
        errorMessage =
          "API key is not configured or invalid. Please check your .env.local file.";
      }

      setMessages((prev) => [...prev, { text: errorMessage, sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-80 h-96 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">LCD Sign Support - AI Chatbot</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="How can we help you today?"
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                disabled={isLoading}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
