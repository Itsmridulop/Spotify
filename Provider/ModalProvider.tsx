"use client";

import { useEffect,useState } from "react";
import AuthModal from "@/component/AuthModal";
import UploadModal from "@/component/UploadModal";

const ModalProvider = () => {
    const [isMounted, setISMounted] = useState(false);

    useEffect(() => {
        setISMounted(true)
    }, [])

    if(!isMounted){
        return null
    }

    return (
        <>
            <AuthModal/>
            <UploadModal/>
        </>
    )
}

export default ModalProvider;