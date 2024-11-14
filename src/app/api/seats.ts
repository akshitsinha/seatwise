import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

export interface Seat {
  id: string;
  status: "available" | "selected" | "unavailable";
  price: number;
}

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

const createSeatsCollection = async (db: any) => {
  const collection = db.collection("seats");
  await collection.createIndex({ seat_id: 1 }, { unique: true });
};

const populateSeats = async (db: any) => {
  const collection = db.collection("seats");
  const stands = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const levels = ["1", "2", "3"];
  const rows = ["A", "B", "C", "D", "E"];
  const seats = [];

  for (const stand of stands) {
    for (const level of levels) {
      for (const row of rows) {
        for (let i = 1; i <= 10; i++) {
          const seatId = `${stand}${level}-${row}${i}`;
          const status = Math.random() > 0.8 ? "unavailable" : "available";
          const price = Math.floor(Math.random() * 1000) + 3000;
          seats.push({ seat_id: seatId, status, price });
        }
      }
    }
  }

  await collection.insertMany(seats, { ordered: false }).catch(() => {});
};

const getSeats = async (db: any) => {
  const collection = db.collection("seats");
  return await collection.find({}).toArray();
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await client.connect();
  const db = client.db("seatwise");

  await createSeatsCollection(db);
  await populateSeats(db);
  const seats = await getSeats(db);

  res.status(200).json(seats);
}
