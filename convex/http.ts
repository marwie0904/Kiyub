import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Add auth HTTP routes for OAuth callbacks and password reset flows
auth.addHttpRoutes(http);

export default http;
