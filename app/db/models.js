import { mongoose } from "mongoose";

const { Schema } = mongoose;

const drejerSchema = new Schema(
  {
    date: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);
export const models = [
  {
    name: "drejer",
    schema: drejerSchema,
    collection: "drejers",
  },
];
