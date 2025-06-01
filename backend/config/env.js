import { config } from "dotenv";

config();

export const { PORT, NODE_ENV, APP_PASSWORD, MY_EMAIL, CLIENT_URL, CLIENT_LOGIN_URL, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET,
} = process.env;