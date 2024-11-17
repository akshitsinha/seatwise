import type { NextApiRequest, NextApiResponse } from "next";
import { Db, MongoClient } from "mongodb";

export interface Seat {
  sid: string;
  status: "available" | "selected" | "unavailable";
  price: number;
}

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

const createSeatsCollection = async (db: Db) => {
  const collection = db.collection("seats");
  await collection.createIndex({ sid: 1 }, { unique: true });
};

const stands = ["A", "B", "C", "D", "E", "F", "G", "H"];
const levels = ["1", "2", "3"];
const rows = ["A", "B", "C", "D", "E"];
const cols = 10;

const populateSeats = async (db: Db) => {
  const collection = db.collection("seats");
  const seats = [];

  for (const stand of stands) {
    for (const level of levels) {
      for (const row of rows) {
        for (let i = 1; i <= cols; i++) {
          const seatId = `${stand}${level}-${row}${i}`;
          const status = Math.random() > 0.8 ? "unavailable" : "available";
          const price = Math.floor(Math.random() * 1000) + 3000;
          seats.push({ sid: seatId, status, price });
        }
      }
    }
  }

  await collection.insertMany(seats, { ordered: false }).catch(() => {});
};

const getSeats = async (db: Db) => {
  const collection = db.collection("seats");
  return await collection.find({}).toArray();
};

export type SeatsResponse = {
  success: boolean;
  data?: {
    seats: Seat[];
    stands: string[];
    levels: string[];
    rows: string[];
    columns: number;
  };
  error?: string;
  stacktrace?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SeatsResponse>
) {
  try {
    await client.connect();
    const db = client.db("seatwise");

    await createSeatsCollection(db);
    await populateSeats(db);
    const seats: any = await getSeats(db);

    if (req.method === "GET") {
      res.status(200).json({
        success: true,
        data: {
          seats: seats,
          stands: stands,
          levels: levels,
          rows: rows,
          columns: cols,
        },
      });
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      stacktrace: error,
    });
  }
}
