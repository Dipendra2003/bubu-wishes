import express from "express";
import { uploadRouter } from "./uploadRoutes";
import { cronRouter } from "./cronRoutes";
import { authRouter } from "./authRoutes";
import { cardsRouter } from "./cardsRoutes";
import { contactsRouter } from "./contactsRoutes";
import { adminRouter } from "./adminRoutes";
import { wishesRouter } from "./wishesRoutes";
import { aiRouter } from "./aiRoutes";
import { reviewsRouter } from "./reviewsRoutes";
import { mediaLibraryRouter } from "./mediaLibraryRoutes";
import profileRouter from "./profileRoutes";

export const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/cards", cardsRouter);
apiRouter.use("/contacts", contactsRouter);
apiRouter.use("/upload", uploadRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/cron", cronRouter);
apiRouter.use("/wishes", wishesRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/media-library", mediaLibraryRouter);
apiRouter.use("/profile", profileRouter);
apiRouter.use("/", aiRouter); // Maps to /api/generate-message

