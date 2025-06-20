'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"

import { toast } from "sonner"
import { useRouter } from "next/dist/client/components/navigation"




import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { signInSchema } from "@/schemas/signInSchema"
import { signIn } from "next-auth/react"


const Page = () => {
  
    
 const router = useRouter()

 //zod implementation
 const form=useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    }  
  })

  

const onSubmit=async(data: z.infer<typeof signInSchema>) => {
    // sign is through next auth
  const result=await signIn('credentials', {
    identifier: data.identifier,
    password: data.password,
    redirect: false,})

    if (result?.error) {
      toast.error('Error', {
      description: "Invalid username or password",
    })
    } 

    if(result?.url){
        router.replace('/dashboard')
    }
}
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Welcome back to Blind Friends
          </h1>
          <p className="mb-4">Sign in to continue your conversation</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email/Username</FormLabel>
                  <Input placeholder="Email/username" {...field}  
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" >
              Sign in
              </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Not a member yet?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Page