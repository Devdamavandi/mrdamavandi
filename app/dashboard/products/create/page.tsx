


import ProductForm from "@/components/dashboard/ProductForm";
import TopNavigationNav from "@/components/dashboard/top-nav";


const CreateProductPage = () => {
    return ( 
        <div className="">
            <TopNavigationNav/>
            <div className="flex justify-between items-center mt-6 mb-2">
                <h1 className="text-2xl font-bold">Add New Product</h1>
         
            </div>

            <div className="bg-white p-6 rounded-lg shadow"><ProductForm/></div>
        </div>
     )
}
 
export default CreateProductPage;