import { z } from 'zod';

export const messageSchema = z.object({
  c : z
  .string()
  .min(10,{message:'Content must be atleast 10 characters long'})
  .max(300,{message:'Content can be atmost 300 characters long'})
}); 