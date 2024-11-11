import fastify from "fastify";

const app = fastify();
const port = 3001;

app.get("/", async (request, reply) => {
  reply.send("Hello, world!");
});

app.get("/api/data", async (request, reply) => {
  reply.send({ message: "This is some sample data" });
});

app.post("/api/data", async (request, reply) => {
  const data = request.body;
  reply.status(201).send({ message: "Data received", data });
});

app.listen(
  {
    port: port,
  },
  (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server is running on ${address}`);
  }
);
