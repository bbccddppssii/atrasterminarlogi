import { ZodError } from "zod"

export const listZodErrors=(error: ZodError)=>{
    const listError = error.issues.map((e) => {
        return {
          path: e.path,
          message: e.message,
        };
      });

      return listError
}