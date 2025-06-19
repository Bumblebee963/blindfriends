import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
//This user is not the one which I injected in the session, this is the one which I get from the next Auth
import {User} from "next-auth"

export async function POST(request: Request) {
    dbConnect();
    const session = await getServerSession(authOptions);
    const user:User=session?.user

    if(!session || !session.user) {
        return NextResponse.json({
             success: false,
             message: "You are not authenticated. Please log in to continue." 
            },
            { status: 401 });
    }

    const userID = user._id?.toString();
    const { acceptMessages } = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userID,
            { isAcceptingMessages: acceptMessages },
            { new: true }
        );
        if (!updatedUser) {
            return NextResponse.json({
                success: false,
                message: "User not found."
            },
            { status: 404 });
        }
        return NextResponse.json({
            success: true,
            message: "User preferences updated successfully.",
            user: {
                isAcceptingMessages: updatedUser.isAcceptingMessages
            }
        },
        { status: 200 }
    );
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({
            success: false,
            message: "Error updating user preferences."
        },
        { status: 500 });
    }

}
export async function GET() {
    dbConnect();
    const session = await getServerSession(authOptions);
    const user:User=session?.user 
    if(!session || !session.user) {
        return NextResponse.json({
             success: false,
             message: "You are not authenticated. Please log in to continue." 
            },
            { status: 401 });
    }
    try {
        const userID = user._id?.toString();
       
        const foundUser = await UserModel.findById(userID)
        if(!foundUser) {
            return NextResponse.json({
                success: false,
                message: "User not found."
            },
            { status: 404 });
        }
    
        return NextResponse.json({
            success: true,
            isAcceptingMessages: foundUser.isAcceptingMessages
            
        });
    } catch (error) {
        console.error("Error fetching user preferences:", error);
        return NextResponse.json({
            success: false,
            message: "Error fetching user preferences."
        },
        { status: 500 });
        
    }
}