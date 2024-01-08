import { faker } from "@faker-js/faker";
import { config } from "dotenv";
config();
import {
  mongoConnect,
  mongoDisconnect,
  mongoListener,
} from "../config/db.connect.js";
import { UserModel } from "../models/user.model.js";
import { ProductModel } from "../models/product.model.js";

mongoListener();
await mongoConnect();
console.log("\u001B[33mPlease wait...\u001B[39m");

const generateProducts = async (num) => {
  // get all users ID and location from Database
  const users = await UserModel.aggregate([
    { $group: { _id: { id: "$_id", loc: "$location" } } },
  ]);

  // return random user ID
  function getUser() {
    const index = Math.floor(Math.random() * users.length);
    return users[index];
  }

  const products = [];
  for (let i = 0; i < num; i++) {
    const type = ["offer", "need"][Math.round(Math.random())];
    const title = faker.commerce.productName();
    const category = [
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
    ][Math.round(Math.random() * 10)];
    const condition = ["Neu", "Sehr gut", "Gut", "Akzeptabel", "Defekt"][
      Math.round(Math.random() * 4)
    ];
    const price = +faker.commerce.price({ dec: 0 });
    const description = faker.commerce.productDescription();
    const images = [
      faker.image.urlLoremFlickr({ category: category.split(" ")[0] }),
      faker.image.urlLoremFlickr({ category: category.split(" ")[0] }),
      faker.image.urlLoremFlickr({ category: category.split(" ")[0] }),
    ];
    const user = getUser()["_id"];
    const location = { zip: user.loc.zip, city: user.loc.city };
    const owner = user.id.toString();

    products.push({
      type,
      title,
      category,
      condition,
      price,
      location,
      description,
      images,
      owner,
    });
  }

  return products;
};

// seed command example: npm run seed <number_of_products>,
const products = await generateProducts(process.argv[2]);

ProductModel.insertMany(products)
  .then((docs) =>
    console.log(
      `\n\u001B[92m${docs.length} products have been inserted into the database.\u001B[39m\n`
    )
  )
  .catch((err) => {
    console.error(err);
  })
  .finally(() => {
    mongoDisconnect();
  });
