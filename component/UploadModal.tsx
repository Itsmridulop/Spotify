import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";
import useUploadModal from "@/hooks/useUploadModal";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import toast from "react-hot-toast";
import uniqid from "uniqid"
import { useRouter } from "next/navigation";

const UploadModal = () => {

    const [isLoading,setIsLoading] = useState(false);
    const { user } = useUser()
    const uploladModal = useUploadModal();
    const supabaseClient = useSupabaseClient();
    const router = useRouter();

    const {register,handleSubmit,reset} = useForm<FieldValues>({
        defaultValues: {
            author:'',
            title:'',
            song: null,
            image: null,
        }
    });
    const onChange = (open: boolean) => {
        if(!open){
            reset();
            uploladModal.onClose();
        }
    }
    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try{
            setIsLoading(true)
            const imageFile = values.image?.[0]
            const songFlie = values.song?.[0]
            if(!imageFile || !songFlie || !user){
                toast.error("Missing Feild")
                return
            }
            const uniqueID = uniqid()
            const {
                data: songData,
                error: songError,
            } = await supabaseClient
            .storage
            .from('songs')
            .upload(`songs-${values.title}-${uniqueID}`,songFlie,{
                cacheControl: "3600",
                upsert: false
            })
            if(songError){
                setIsLoading(false)
                return toast.error("Failed upload song...")
            }
            const {
                data: imageData,
                error: imageError,
            } = await supabaseClient
            .storage
            .from('image')
            .upload(`image-${values.title}-${uniqueID}`,imageFile,{
                cacheControl: "3600",
                upsert: false
            })
            if(imageError){
                setIsLoading(false)
                return toast.error("Failed upload Image...")
            }
            const {
                error: supabaseError
            } = await supabaseClient
            .from("songs")
            .insert({
                user_id: user.id,
                title: values.title,
                author: values.author,
                image_path: imageData.path,
                song_path: songData.path
            })
            if(supabaseError){
                setIsLoading(false)
                return toast.error(supabaseError.message)
            }
            router.refresh();
            setIsLoading(false)
            toast.success("Song created!")
            reset();
            uploladModal.onClose();

        }
        catch (error){
            toast.error("Something went worng!!")
        }
        finally{
            setIsLoading(false)
        }
    }
    return(
        <Modal title="Add songs" description="Upload mp3 file" isOpen={uploladModal.isOpen} onChange={onChange}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
                <Input id='title' disabled={isLoading} {...register('title',{required: true})} placeholder='Song title'/>
                <Input id='author' disabled={isLoading} {...register('author',{required: true})} placeholder='Song author'/>
                <div>
                    <div className="pb-1 ">
                        select a song file  
                    </div>
                    <Input type="file" id="song" accept=".mp3" disabled={isLoading} {...register('song',{required: true})}/>
                </div>
                <div>
                    <div className="pb-1 ">
                        select a image file  
                    </div>
                    <Input type="file" id="image" accept="image/*" disabled={isLoading} {...register('image',{required: true})}/>
                </div>
                <Button disabled={isLoading} type="submit">Create</Button>
            </form>
        </Modal>
    )
}

export default UploadModal;