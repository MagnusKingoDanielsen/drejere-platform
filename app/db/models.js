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

const campsSchema = new Schema({
  CampName: {
    type: String,
    required: true,
  },
  StartDate: {
    type: String,
    required: true,
  },
  EndDate: {
    type: String,
    required: true,
  },
  CampLeader: {
    type: String,
    required: true,
  },
  CampDescription: {
    type: String,
    required: true,
  },
  Participants: {
    type: String,
    required: true,
  },
});

export const models = [
  {
    name: "drejers",
    schema: drejerSchema,
    collection: "drejers",
  },
  {
    name: "camps",
    schema: campsSchema,
    collection: "camps",
  },
];
