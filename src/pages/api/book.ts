import type { NextApiRequest, NextApiResponse } from "next";
import { Db, MongoClient } from "mongodb";
import { Seat } from "./seats";

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

const getNextTicketId = async (db: Db) => {
  const collection = db.collection("tickets");
  const result = await collection.insertOne({ createdAt: new Date() });
  return result.insertedId.toString();
};

const bookSeats = async (db: Db, seatIds: string[]) => {
  const collection = db.collection("seats");
  const seats = await collection.find({ sid: { $in: seatIds }, status: "available" }).toArray();

  if (seats.length !== seatIds.length) {
    throw new Error("Some seats are not available");
  }

  await collection.updateMany(
    { sid: { $in: seatIds } },
    { $set: { status: "unavailable" } }
  );

  return seats;
};

const logBooking = async (db: Db, ticketId: string, seats: Seat[], amount: number) => {
  const collection = db.collection("bookings");
  await collection.insertOne({
    ticketId,
    seats,
    amount,
    bookedAt: new Date(),
  });
};

export type BookResponse = {
  success: boolean;
  data?: {
    ticketId: string;
    seats: Seat[];
    amount: number;
  };
  error?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BookResponse>
) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    const { seatIds } = req.body;
    if (!seatIds || !Array.isArray(seatIds)) {
      res.status(400).json({ success: false, error: "Invalid seatIds" });
      return;
    }

    await client.connect();
    const db = client.db("seatwise");

    const seats: any = await bookSeats(db, seatIds);
    const amount = seats.reduce((sum: any, seat: any) => sum + seat.price, 0);
    const ticketId = await getNextTicketId(db);

    await logBooking(db, ticketId, seats, amount);

    res.status(200).json({
      success: true,
      data: {
        ticketId,
        seats,
        amount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error,
    });
  } finally {
    await client.close();
  }
}

