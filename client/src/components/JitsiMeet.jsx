import {useEffect,useRef} from "react";

export default function JitsiMeet({roomName}) {
    console.log("Setting room:", roomName);
    const jitsiContainerRef = useRef(null);
    useEffect(()=>{
        const domain = "meet.jit.si";
        const options={
            roomName,
            width: "100%",
            height:600,
            parentNode: jitsiContainerRef.current,
            configOverwrite:{},
            interfaceConfigOverwrite:{
                SHOW_JITSI_WATERMARK:false,
            },
        };
        const api=new window.JitsiMeetExternalAPI(domain,options);
        return () => {
            api?.dispose?.();
        }
    },[roomName]);
    return(
        <div ref={jitsiContainerRef} className="rounded-xl overflow-hidden"/>
    );
}