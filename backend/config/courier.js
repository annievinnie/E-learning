import { CourierClient } from "@trycourier/courier";

let courier = null;

const getCourierClient = () => {
  if (!courier) {
    const authToken = process.env.COURIER_AUTH_TOKEN;
    if (!authToken) {
      throw new Error("COURIER_AUTH_TOKEN environment variable is required");
    }
    courier = new CourierClient({
      authorizationToken: authToken,
    });
  }
  return courier;
};

export default getCourierClient;
