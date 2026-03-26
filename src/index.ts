import express from "express";
import { eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import { demoUsers } from "./db/schema/index.ts";

const app = express();
const PORT = 8000;

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Classroom Management Backend" });
});

// READ: Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await db.select().from(demoUsers);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// CREATE: Add a new user
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "name and email are required" });
    }

    const [newUser] = await db
      .insert(demoUsers)
      .values({ name, email })
      .returning();

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// UPDATE: Update a user by ID
app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const [updatedUser] = await db
      .update(demoUsers)
      .set({ name, email })
      .where(eq(demoUsers.id, parseInt(id)))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE: Remove a user by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await db
      .delete(demoUsers)
      .where(eq(demoUsers.id, parseInt(id)))
      .returning();

    if (!deletedUser.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully", user: deletedUser[0] });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
  console.log(`📦 Express + Drizzle + Neon serverless ready`);
});
