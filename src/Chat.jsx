import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { GoogleGenAI } from "@google/genai";
import { marked } from "marked";
import 'remixicon/fonts/remixicon.css';
import { v4 as uuidv4 } from 'uuid';




function Chat() {
    const [ messages, setMessages] = useState([])
    const [query , setQuery] =  useState("");
    const [answer , setAnswer] = useState("");
    
    const apiKey = import.meta.env.VITE_API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const chatSession = useRef(null); // to keep chatsession consistent during re render
    const [loading , setLoading] = useState(true);
    const scrollRef = useRef(null);

   // to keep chat at bottom for better ux
   useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);


// setup google chat when it mounts 
  useEffect(()=>{
      console.log("setUp for chat")
      chatSession.current = ai.chats.create({
        model:"gemini-2.0-flash",
        systemInstruction: "Give concise and helpful answer",
      })
      setLoading(false);
    },[])
    


 // handel user query
  const handelSubmit = async() => {

      console.log("indside handel submit")
      setMessages((prev)=> [...prev , { id: uuidv4()  , role : "user", parts:[{text : query}]}])
      setQuery("")
      const response = await chatSession.current.sendMessageStream({
        message : query,
      })
      let ans = ""
      for await (const chunk of response){
        ans += chunk.text;
      }
      console.log(ans)
      setAnswer(ans)
      setMessages((prev) => [...prev , {id: uuidv4() , role : "model" , parts:[{text : ans}]}])
    }



    // to load gemini api 
    if(loading)
      return <div className="flex justify-center h-screen items-center text-2xl">ScreenSense AI is Loading...</div>


  return (
   <div className=''>
    {/* chat history  */}
    
      <div className= "flex justify-center">
        <div className='w-[55vw] max-h-[70vh] mt-10 overflow-y-scroll'>
      { messages.map((message) => (
        <div
        key={message.id}>

        { message.role === "user" ? ( 
          <div className='flex justify-end mt-1'>
          <div className='p-4 bg-[#3674B5] text-white rounded-[20px] max-w-[60%] break-words'>
            {message.parts[0].text}
          </div>
        </div> ) :
          (<div className='flex justify-start mt-1'>
            <div
              className='p-4 text-white rounded-[20px] bg-[#578FCA] max-w-[60%] break-words'
              dangerouslySetInnerHTML={{ __html: marked(message.parts[0].text) }}
            ></div>
          </div>)
          }
             
        </div>
      ))}
      <div ref={scrollRef} />
        </div>
      </div> 
    




    {/* styling ask tab */}
    <div className='flex justify-center'>
    <form className='fixed bottom-15 w-fit p-3 border-1 rounded-[20px] '
    onSubmit={(e) => {
      console.log("submit")
      e.preventDefault();
      handelSubmit(); 
      }}>

      <input type="text" 
      placeholder="Ask ScreenSense"
      className='p-2 border-none w-[50vw] outline-none text-xl'
      value={query}
      onChange={(e)=> setQuery(e.target.value)} />
      <button type="submit" className='px-2 py-1 bg-gray-200 border-1 rounded-[50%]'><i className="ri-arrow-up-line 
        text-2xl"></i></button>
    </form>
    </div>
    </div>

  )
}

export default Chat