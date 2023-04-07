import { RequestHandler } from "express";
import mongoose from "mongoose";
export const checkObjectId : RequestHandler = async (req, res, next) => {
    if (mongoose.isValidObjectId(req.params.id)) return next();
    return res.status(400).json({
      msg: 'Id invalido'
    })
  };
  