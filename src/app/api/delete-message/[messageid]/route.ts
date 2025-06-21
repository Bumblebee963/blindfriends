import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
//This user is not the one which I injected in the session, this is the one which I get from the next Auth
import {User} from "next-auth"


export async function DELETE(request: Request, { params }: { params: { messageid: string } }) {
    // id will be of type http://localhost/3000/.../messageid
    const messageId = params.messageid;
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

    try{
        const updateResult=await UserModel.updateOne(
            {_id: user._id},
            {$pull:{messages : {_id:messageId}}}
        )
        //to check if the result was actually updated
        if(updateResult.modifiedCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Message not found or already deleted."
                },
                { status: 404 }
            );
        }
        return NextResponse.json(
            {
                success: true,
                message: "Message deleted successfully."
            },
            { status: 200 }
        );  
    } catch (error) {
        console.error("Error deleting message:", error);
        return NextResponse.json(
            {
                success: false,
                message: "An error occurred while deleting the message."
            },
            { status: 500 }
        );
    }
    
}