
'use client'

import { motion } from 'framer-motion'

const FramerMotionTestPage = () => {

    
    return ( 
        <section className='h-[80vh] flex flex-col stroke-current items-center'>
            <motion.h1
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className='text-5xl font-bold'
            >
                Welcome to My Store
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate= {{ opacity: 1 }}
                transition = {{ duration: 0.3 }}
                className='text-lg text-gray-600 mt-4'
            >
                Shop the best details today
            </motion.p>
        </section>
     )
}
 
export default FramerMotionTestPage;