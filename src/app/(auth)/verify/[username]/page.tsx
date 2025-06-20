'use client'
import { verifySchema } from '@/schemas/verifySchema';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';


const VerifyAccount=()=>{
    //router is needed so that I can redirect
    const router = useRouter();
    //useParams is needed to get the username from the URL(dynamic parameter)
    const param=useParams();
    const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  //when form is submitted, we will call the verify function
  const onSubmit=async (data: z.infer<typeof verifySchema>) => {
    //data will contain the username and token
    try {
        const response=await axios.post(`/api/verify-code`,{username:param.username,
         code:data.code});
        toast.message('Success', {
      description: response.data.message,
    })
    router.replace(`sign-in`); // redirect to login page after successful verification
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.message || "An error occurred during verification.";
        toast.message('Error', {
          description: errorMessage,
        });
    }

  }
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-800">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                    Verify your account
                </h1>
                <p className="mb-4">Enter the verification code sent to your email</p>
                </div>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    name="code"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <Input {...field} />
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit">Verify</Button>
                </form>
                </Form>

            </div>
            
        </div>
    );
}

export default VerifyAccount;