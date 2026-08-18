
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

interface AgeValidationFormProps {
  onSelectAge: (ageGroup: "kids" | "teens" | "pro", playerName: string) => void;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  age: z.coerce.number()
    .min(5, { message: "You must be at least 5 years old to play." })
    .max(99, { message: "Please enter a valid age." })
});

const AgeValidationForm: React.FC<AgeValidationFormProps> = ({ onSelectAge }) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: undefined
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const { name, age } = values;
    let ageGroup: "kids" | "teens" | "pro";

    if (age >= 5 && age <= 12) {
      ageGroup = "kids";
    } else if (age >= 13 && age <= 17) {
      ageGroup = "teens";
    } else {
      ageGroup = "pro";
    }
    
    toast({
      title: "Welcome!",
      description: `Hi ${name}, you've been redirected to the ${ageGroup} section.`,
    });

    onSelectAge(ageGroup, name);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500 bg-clip-text text-transparent">
          Tell us about yourself
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Age</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter your age" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500 text-white"
            >
              Continue
            </Button>
          </form>
        </Form>
      </motion.div>
    </div>
  );
};

export default AgeValidationForm;
