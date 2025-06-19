import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {z} from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

import { NextResponse } from "next/server";

const UsernameQuerySchema = z.object({ 
    //username should fulfil username validation schema
    username: usernameValidation
})

export async function GET(request: Request) {
    
    await dbConnect();

    try {
        //For extracting query parameters from the request
        const {searchParams}=new URL(request.url);
        const queryParam={
            username: searchParams.get("username")
        }
        //Validate the query parameters
        const result=UsernameQuerySchema.safeParse(queryParam);
        console.log(result) // For debugging purposes, to be removed in production

        if(!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This is not a valid username",
                },
                {
                    status: 400
                }
            );
        }
        const { username } = result.data;
        // Check if the username already exists in the database
        
        const existingVerifiedUser=await UserModel.findOne({ username, isVerified: true })

        if(existingVerifiedUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username is already taken"
                },
                {
                    status: 409
                }
            );
        }
        // If the username is unique, return success response
        return NextResponse.json(
            {
                success: true,
                message: "Username is available"
            },
            {
                status: 200
            }
        );
    } catch (error) {
        console.error("Error checking username uniqueness:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error checking username uniqueness"
            },
            {
                status: 500
            }
        );
    }
}