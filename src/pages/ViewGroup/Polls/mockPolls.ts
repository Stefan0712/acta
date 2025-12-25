import type { Poll } from "../../../types/models";

export const mockPolls: Poll[] = [
  {
    _id: "poll_001",
    groupId: "group_abc",
    authorId: "user_stefan",
    authorUsername: "Stefan",
    title: "Where should we have the Christmas dinner?",
    description: "Please vote for your preferred restaurant for our annual group dinner.",
    allowCustomOptions: false, // Fixed options
    expiresAt: new Date("2025-12-30T20:00:00Z"), // Ongoing (Future date)
    createdAt: new Date("2025-12-20T10:00:00Z"),
    updatedAt: new Date("2025-12-20T10:00:00Z"),
    options: [
      { _id: "opt_1", text: "The Italian Bistro", votes: ["user_1", "user_2"] },
      { _id: "opt_2", text: "Steakhouse Prime", votes: ["user_3"] },
      { _id: "opt_3", text: "Sushi Zen", votes: [] }
    ]
  },
  {
    _id: "poll_002",
    groupId: "group_abc",
    authorId: "user_alex",
    authorUsername: "Alex",
    title: "New Project Name Suggestions",
    description: "If you have a better idea, feel free to add your own option!",
    allowCustomOptions: true, // Crowdsourced
    expiresAt: new Date("2026-01-05T12:00:00Z"), // Ongoing (Future date)
    createdAt: new Date("2025-12-24T09:00:00Z"),
    updatedAt: new Date("2025-12-25T11:00:00Z"),
    options: [
      { _id: "opt_4", text: "Project Phoenix", votes: ["user_stefan", "user_4", "user_5"] },
      { _id: "opt_5", text: "Nebula Dashboard", votes: ["user_6"] }
    ]
  },
  {
    _id: "poll_003",
    groupId: "group_abc",
    authorId: "user_maria",
    authorUsername: "Maria",
    title: "Weekend Trip Destination",
    description: "Voting for the upcoming trip is now closed.",
    allowCustomOptions: false,
    expiresAt: new Date("2025-12-20T18:00:00Z"), // Closed (Past date)
    createdAt: new Date("2025-12-10T14:00:00Z"),
    updatedAt: new Date("2025-12-20T18:00:00Z"),
    options: [
      { _id: "opt_6", text: "Mountain Cabin", votes: ["user_1", "user_2", "user_3", "user_4"] },
      { _id: "opt_7", text: "Beach Resort", votes: ["user_5", "user_6"] }
    ]
  }
];