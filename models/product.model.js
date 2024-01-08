import { Schema, model } from "mongoose";

const ProductSchema = new Schema({
  type: {
    type: String,
    enum: {
      values: ["offer", "need"],
      message: "Type '{VALUE}' is not supported",
    },
    required: true,
  },

  title: {
    type: String,
    required: true,
    minLength: [10, "Title must be at least 10 characters}"],
  },

  category: {
    type: String,
    enum: {
      values: [
        "Elektronik",
        "Kleidung & Accessoires",
        "Haushalt & Möbel",
        "Sport & Freizeit",
        "Fahrzeuge",
        "Bücher & Medien",
        "Hobby & Sammeln",
        "Garten & Pflanzen",
        "Tierbedarf",
        "Dienstleistungen",
        "Sonstiges",
      ],
      message: "Category '{VALUE}' is not supported",
    },
    required: true,
  },

  condition: {
    type: String,
    enum: {
      values: ["Neu", "Sehr gut", "Gut", "Akzeptabel", "Defekt"],
      message: "Condition '{VALUE}' is not supported",
    },
    required: true,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  location: {
    zip: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 5,
    },
    city: {
      type: String,
      required: true,
    },
  },

  description: { type: String },
  images: [String],
  owner: { type: Schema.Types.ObjectId, ref: "user" },

  status: {
    type: String,
    enum: {
      values: ["active", "reserved", "sold", "inactive"],
      message: "Status '{VALUE}' is not supported",
    },
    default: "active",
  },
});

export const ProductModel = model("product", ProductSchema);
