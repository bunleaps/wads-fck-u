const ticketsData = [
  {
    _id: { $oid: "68277aa7d6331f3f05324bd4" },
    title: "LED Sign Design Approval",
    purchase: { $oid: "68277aa7d6331f3f05324bca" },
    creator: { $oid: "68277aa7d6331f3f05324bbf" },
    assignedAdmin: { $oid: "68277aa7d6331f3f05324bbc" },
    status: "open",
    messages: [
      {
        sender: { $oid: "68277aa7d6331f3f05324bbf" },
        content: "Please check my sign design requirements and mockup.",
        attachments: [
          {
            filename: "design_mockup.png",
            url: "https://example.com/uploads/design_mockup.png",
            _id: { $oid: "68277aa7d6331f3f05324bd6" },
          },
        ],
        _id: { $oid: "68277aa7d6331f3f05324bd5" },
        createdAt: { $date: { $numberLong: "1747417767755" } },
        updatedAt: { $date: { $numberLong: "1747417767755" } },
      },
    ],
    createdAt: { $date: { $numberLong: "1747417767755" } },
    updatedAt: { $date: { $numberLong: "1747417767755" } },
    __v: { $numberInt: "0" },
  },
  {
    _id: { $oid: "68277aa7d6331f3f05324bcf" },
    title: "Installation Request for Business Sign",
    purchase: { $oid: "68277aa7d6331f3f05324bc7" },
    creator: { $oid: "68277aa7d6331f3f05324bbe" },
    assignedAdmin: { $oid: "68277aa7d6331f3f05324bbc" },
    status: "in_progress",
    messages: [
      {
        sender: { $oid: "68277aa7d6331f3f05324bbe" },
        content:
          "When can you install my business sign? Here's the location photo.",
        attachments: [
          {
            filename: "location.jpg",
            url: "https://example.com/uploads/location.jpg",
            _id: { $oid: "68277aa7d6331f3f05324bd1" },
          },
        ],
        _id: { $oid: "68277aa7d6331f3f05324bd0" },
        createdAt: { $date: { $numberLong: "1747417767755" } },
        updatedAt: { $date: { $numberLong: "1747417767755" } },
      },
      {
        sender: { $oid: "68277aa7d6331f3f05324bbc" },
        content:
          "I've reviewed the location photo. We can schedule the installation for next week. Here's our installation guide.",
        attachments: [
          // {
          //   filename: "installation_guide.pdf",
          //   url: "https://example.com/uploads/installation_guide.pdf",
          //   _id: { $oid: "68277aa7d6331f3f05324bd3" },
          // },
        ],
        _id: { $oid: "68277aa7d6331f3f05324bd2" },
        createdAt: { $date: { $numberLong: "1747417767755" } },
        updatedAt: { $date: { $numberLong: "1747417767755" } },
      },
    ],
    createdAt: { $date: { $numberLong: "1747417767755" } },
    updatedAt: { $date: { $numberLong: "1747417767755" } },
    __v: { $numberInt: "0" },
  },
];

export default ticketsData;
