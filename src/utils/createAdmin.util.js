import dotenv from "dotenv";
import { UserModel } from "../models/user.model.js";

dotenv.config();

const accountType = process.env.ADMIN_ACCOUNT_TYPE;
const accountStatus = process.env.ADMIN_ACCOUNT_STATUS;
const firstName = process.env.ADMIN_FIRST_NAME;
const lastName = process.env.ADMIN_LAST_NAME;
const companyName = process.env.ADMIN_COMPANY_NAME;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const phone = process.env.ADMIN_PHONE;
const address = process.env.ADMIN_ADDRESS;
const productType = process.env.ADMIN_PRODUCT_TYPE;

if (
  !accountType ||
  !accountStatus ||
  !firstName ||
  !lastName ||
  !companyName ||
  !email ||
  !password ||
  !phone ||
  !address ||
  !productType
) {
  throw new Error(
    "Missing required environment variables for admin account creation."
  );
}

export const createAdmin = async () => {
  const isAdminExist = await UserModel.findOne({ email });

  if (!isAdminExist) {
    try {
      await UserModel.create({
        accountType,
        accountStatus,
        firstName,
        lastName,
        companyName,
        email,
        password,
        phone,
        address,
        productType,
      });
    } catch (error) {
      console.error("An error occurred while creating admin.\n", error);
    }
  }
};
