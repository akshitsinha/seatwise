import type { NextApiRequest, NextApiResponse } from "next";
import type { Seat } from "./seats";

const seats: Seat[][][][] = [
  
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { level, stand, row, column } = req.body;

    const seat = seats[level][stand][row][column];
    if (seat.occupied) {
      return res.status(400).json({ message: "Seat already occupied" });
    }

    seat.occupied = true;
    seat.ticketId = `ticket-${Date.now()}`;

    return res.status(200).json({ ticketId: seat.ticketId });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
