import { Button } from "@/components/ui/button";
import Link from "next/link";




const ErrorPage = () => {
    return ( 
        <div>
            <p>Oops! Something went wrong!!</p>
            <Button>
                <Link href={'/login'}>Back to login</Link>
            </Button>
        </div>
     );
}
 
export default ErrorPage;