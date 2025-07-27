import { poppins } from "@/lib/fonts";
import { useForm } from "react-hook-form";




const NewsletterForm = () => {

    const { register, handleSubmit, formState: {errors} } = useForm({ 
        defaultValues: {
            email: '',
        }
    })

    const onSubmit = () => {

    }

    return ( 
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-2">
                <input 
                    id="email"
                    {...register('email')}
                    type="email" 
                    className={`p-3 border rounded-md ${errors.email && 'border-red-500'} w-[500px] ${poppins.className} font-light`}
                    placeholder="john@gmail.com"
                />
                <button type="submit" className="w-full bg-black px-4 py-3 text-white rounded">
                    Subscribe
                </button>
            </form>        
        </div>
     )
}
 
export default NewsletterForm;