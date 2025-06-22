import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
//This user is not the one which I injected in the session, this is the one which I get from the next Auth
import {User} from "next-auth"
import mongoose from "mongoose";

export async function GET() {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user;
    if (!session || !session.user) {
        return NextResponse.json(
            {
                success: false,
                message: "You are not authenticated. Please log in to continue."
            },
            { status: 401 }
        );
    }
    const userID = new mongoose.Types.ObjectId(user._id);
    try {
        const user=await UserModel.aggregate([
            {
                $match: {
                    _id: userID
                }
            },
            {
                //To convert the messages array into a stream of documents
                $unwind : "$messages"
            },
            {
                $sort: {
                    "messages.createdAt": -1
                }
            },
            {
                $group: {
                    // Grouping by user ID to collect all messages in an array in sorted order
                    _id: "$_id",
                    messages: {
                        $push: "$messages"
                    }
                } 
            }
        ]);

        if(!user || user.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found."
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                messages: user[0].messages
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error fetching messages."
            },
            { status: 500 }
        );
    }
}