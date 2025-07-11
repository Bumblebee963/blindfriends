import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import UserModel from "@/model/User";
import bcrypt from 'bcryptjs'

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request){
    await dbConnect()

    try{
        const{username,email,password}=await request.json()
        const existingUserVerifiedByUserame= await UserModel.findOne({
            username,
            isVerified:true
        })
        if(existingUserVerifiedByUserame){
            return NextResponse.json(
                {
                    success: false,
                    message: "Username already taken"
                },
                {
                    status: 400
                }
            )
        }

        const existingUserByEmail=await UserModel.findOne({email});
        const verifyCode=Math.floor(100000+Math.random()*900000).toString()
        
        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return NextResponse.json(
                    {
                        success: false,
                        message: "User already exists with this email"
                    },
                    {
                        status: 400
                    }
                )
            } else{
                const hashedPassword=await bcrypt.hash(password,10)
                existingUserByEmail.password=hashedPassword
                existingUserByEmail.verifyCode=verifyCode
                existingUserByEmail.verifyCodeExpiry=new Date(Date.now()+3600000)
                await existingUserByEmail.save()
            }
        }
        else{
            const hashedPassword=await bcrypt.hash(password,10)
            const expiryDate=new Date()
            expiryDate.setHours(expiryDate.getHours()+1) 

            const newUser= new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate, 
                isVerified: false,
                isAcceptingMessages: true,
                messages: [],
            })

            await newUser.save()
        }

        //send verification email
        const emailResponse=await sendVerificationEmail(
            email,
            username,
            verifyCode,
        )

        if(!emailResponse.success){
            return NextResponse.json({
                success: false,
                message: emailResponse.message
            },{status: 500})
        }

        return NextResponse.json({
            success: true,
            message: emailResponse.message
        },{status: 201})
        
    } catch(error){
        console.error('Error registering user',error)
        
        return NextResponse.json(
            {
                success: false,
                message: "Error registering user"
            },
            {
                status: 500
            }
        )
    }
}