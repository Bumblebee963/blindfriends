import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { verifySchema } from "@/schemas/verifySchema";
import { NextResponse } from "next/server";
import {z} from "zod";

const VerifyCodeSchema = z.object({
    verifyCode: verifySchema.shape.code,
})
export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, verifyCode } = await request.json();
        
        const result = VerifyCodeSchema.safeParse({ verifyCode });
        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid verification code format"
                },
                {
                    status: 400
                }
            );
        }
       const user=await UserModel.findOne({ username })
       if(!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            );
        }

        const isCodeValid = user.verifyCode === verifyCode
        const isCodeNotExpired=user.verifyCodeExpiry > new Date();
        
        if(isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
        await user.save();
        return NextResponse.json(
            {
                success: true,
                message: "User verified successfully"
            },
            {
                status: 200
            }
        );
        } else if (!isCodeValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid verification code"
                },
                {
                    status: 400
                }
            );
        } else if (!isCodeNotExpired) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Verification code has expired"
                },
                {
                    status: 400
                }
            );
        }
        
        
        
        
    } catch (error) {
        console.error("Error verifying code:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error verifying code"
            },
            {
                status: 500
            }
        );
    }
}