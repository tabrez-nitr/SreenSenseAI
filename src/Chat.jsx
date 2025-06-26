import React, { useEffect, useRef, useState } from 'react'
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

    const chatSession = useRef(null);
    const [loading , setLoading] = useState(true);




  useEffect(()=>{
      console.log("setUp for chat")
      chatSession.current = ai.chats.create({
        model:"gemini-2.0-flash",
        systemInstruction: "Give concise and helpful answer",
      })
      setLoading(false);
    },[])
    



  const handelSubmit = async() => {

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




    if(loading)
      return <div className="flex justify-center h-screen items-center text-2xl">ScreenSense AI is Loading...</div>

  return (
   <div className=''>
    {/* chat history  */}
    <div className='flex justify-center mt-20'>
   
      { messages.map((message) => (
        <div
        key={message.id}
        className={`p-2  ${ message.role === "user" ?
           "text-right" : "text-left"
        }`}>

        { message.role === "user" ? ( <div>
            {message.parts[0].text}
          </div> ) :
          ( <div dangerouslySetInnerHTML={{ __html: marked(answer) }}></div>)
          }
             
        </div>
      ))}
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