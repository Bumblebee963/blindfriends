'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDebounceValue,useDebounceCallback } from 'usehooks-ts'
import { toast } from "sonner"
import { useRouter } from "next/dist/client/components/navigation"

import axios, { AxiosError } from "axios"

import { ApiResponse } from "@/types/ApiResponse"
import { signUpSchema } from "@/schemas/signUpSchema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"


const Page = () => {
  const [username, setUsername] = useState("")
  const [usernameMessage, setUsernameMessage] = useState("")
  //Loader field while the chheck is being made
  const [isCheckingUserName, setIsCheckingUserName] = useState(false)
  // form state
  const [isSubmitting, setIsSubmitting] = useState(false)

  //Now we need to send the username somewhere and the backend get request will be handled through the useDebounceValue hook
  // to avoid sending the request on every keystroke
  const debounced = useDebounceCallback(setUsername, 300)
  
 const router = useRouter()

 //zod implementation
 const form=useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    }  
  })

  useEffect(() => {
    const checkUsernameUnique= async()=>{
      if(username){
        setIsCheckingUserName(true)
        setUsernameMessage('')
        try {
          const response=await axios.get(`/api/check-username-unique?username=${username}`)
          setUsernameMessage(response.data.message)
        } catch (error) {
          const axiosError=error as AxiosError<ApiResponse>;
          setUsernameMessage(axiosError.response?.data.message || "An error occurred while checking the username.")
        } finally {
          setIsCheckingUserName(false)
        }
      }
    }
    checkUsernameUnique()
  },[username]
)

const onSubmit=async(data: z.infer<typeof signUpSchema>) => {
  setIsSubmitting(true)
  try {
    const response=await axios.post(`/api/sign-up`, data)
    toast.message('Success', {
      description: response.data.message,
    })
    router.replace(`/verify/${username}`)  
    setIsSubmitting(false)
  } catch (error) {
    console.error("Error during sign up:", error)
    const axiosError=error as AxiosError<ApiResponse>;
    const errorMessage = axiosError.response?.data.message || "An error occurred during sign up."
    // this .error is for showing a destructive message (red background)
    toast.error('Error', {
      description: errorMessage,
    })
    setIsSubmitting(false)
  }
}
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Welcome to Blind Friends
          </h1>
          <p className="mb-4">Sign in to continue your secret conversations</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field}
                    //on change is required here and not in other fields because we need to update the username state
                    onChange={(e) => {
                        field.onChange(e)
                        debounced(e.target.value)
                    }}
                    />
                    </FormControl>
                    {isCheckingUserName && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    <p className={`text-sm ${usernameMessage ==="Username is available" ? 'text-green-500'
                          : 'text-red-500'}`}>
                        test {usernameMessage}
                    </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input placeholder="Enter your email" {...field}  
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
            <Button type="submit" disabled={isSubmitting}>
              {
                isSubmitting ? (
                  <>
                    <Loader2 className="=mr-2 h-4 w-4 animate-spin"/>
                  </>
                ) : ('SignUp')
              }
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