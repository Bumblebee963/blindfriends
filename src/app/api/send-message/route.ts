import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message} from "@/model/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    await dbConnect();
    // It is not necessary for thre user to be authenticated to send a message
    const { username, content } = await request.json();
    try {
        const user = await UserModel.findOne({  username });
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found."
            }, { status: 404 });
        }
        if (!user.isAcceptingMessages) {
            return NextResponse.json({
                success: false,
                message: "User is not accepting messages."
            }, { status: 403 });
        }

        const newMessage={content : content, createdAt: new Date()};
        // Create a new message and push it to the user's messages array
        user.messages.push(newMessage as Message);
        await user.save();
        return NextResponse.json({
            success: true,
            message: "Message sent successfully",
            data: {
                username: user.username,
                message: newMessage
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json({
            success: false,
            message: "Error sending message."
        }, { status: 500 });
    }
}