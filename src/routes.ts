import { withRoutes } from "@helpers";
import { miscRoutes } from "@modules/misc";
import { Router } from "express";

const routes = (app: Router) => {
  app.get("/health-check", (_, res) => {
    res.status(200).json({ status: "OK" });
  });

  // Register all routes here
  app.use("/misc", miscRoutes);

  // Handle 404
  app.all("/*splat", (_, res) => {
    res.status(404).json({
      error: "Requested URL not found!",
    });
  });
};

export const configureRoutes = withRoutes(routes);
