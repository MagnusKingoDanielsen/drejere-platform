import { mongoose } from "mongoose";

const { Schema } = mongoose;

const drejerSchema = new Schema(
  {
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
    birthday: {
      type: String,
      required: false,
    },
    lastLogin: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    tags: {
      type: Array,
      required: true,
    },
    activities: {
      type: Array,
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
    type: Date,
    required: true,
  },
  EndDate: {
    type: Date,
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
    type: Array,
    required: true,
  },
});

const tags = new Schema({
  tag: {
    type: String,
    required: true,
  },
});

const activities = new Schema({
  activity: {
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
  {
    name: "tags",
    schema: tags,
    collection: "tags",
  },
  {
    name: "activities",
    schema: activities,
    collection: "activities",
  },
];
