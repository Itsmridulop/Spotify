"use client"
import Box from "@/component/Box"
import { BounceLoader } from "react-spinners"

const Loading = () => {
    return(
        <Box className="h-full flex itemd-center justify-center">
            <BounceLoader color="#22c55e" size={40}/>
        </Box>
    )
}

export default Loading