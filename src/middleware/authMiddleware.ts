import { Request, Response } from "express";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { ErrorResponse } from "../helper/responseHelper";

const authMiddleware = {
  verifyToken: (req: Request, res: Response, next: any) => {
    const tokenHeader = req.header("Authorization");
    if (tokenHeader) {
      const accesToken = tokenHeader.split(" ")[1];
      jwt.verify(
        accesToken,
        process.env.JWT_SECRET as string,
        (err, decoded) => {
          if (err) {
            return ErrorResponse(res, "Token is not valid ! ", 403, err);
          }
          const userInfo = (decoded as any).user;
          (req as any).user = userInfo;

          next();
        },
      );
    } else {
      return ErrorResponse(res, "you`re not authenticated ! ", 401);
    }
  },
  verifyTokenAndAdminAuth: (req: Request, res: Response, next: any) => {
    authMiddleware.verifyToken(req, res, () => {
      const user = (req as any).user;
      if (user?.role === "admin") {
        next();
      } else {
        return ErrorResponse(res, "You`re not allowed to get users !", 403);
      }
    });
  },
};
export default authMiddleware;
