"use client"
import { useState, useEffect } from "react"
import { Box, Stack, TextField, Button } from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/app/firebase/config'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth';


export default function Home() {

   const [user] = useAuthState(auth)
   console.log({user})
   const router = useRouter()
   //const userSession = sessionStorage.getItem('user');

   
 
   /*
   if (!user && !userSession) {
    router.push('sign-up')
   }*/
   
   useEffect(() => {
    const userSession = sessionStorage.getItem('user');
    if (!user && !userSession) {
      router.push('sign-up');
    } 
  }, [user, router]);
  
  /*
   const [userSession, setUserSession] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // This code runs only in the browser
      const sessionUser = sessionStorage.getItem('user');
      setUserSession(sessionUser);
      if (!user && !sessionUser) {
        router.push('sign-up');
      }
    }
  }, [user, router]);
*/
  

const initialMessage = user
  ? `Hi ${user.displayName}! I'm the Headstarter support assistant. How can I help you today?`
  : 'Hi! I\'m the Headstarter support assistant. How can I help you today?';

const [messages, setMessages] = useState([
    {role: "assistant", content: initialMessage}//"Hi! I'm the Headstarter support assistant. How can I help you today?"}
  ])

  const [message, setMessage] = useState('')

  const sendMessage = async () => {
    setMessage('')
    setMessages((messages) => [...messages, {role:"user", content: message}, {role:"assistant", content: " "}])
    const response = fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, {role: "user", content: message}]),
    }).then(async (res) => {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let result = ''
        return reader.read().then(function processText({done, value}) {
            if (done) {
                return result
            }
            const text = decoder.decode(value || new Uint8Array(), {stream: true})
            setMessages((messages) => {
                let lastMessage = messages[messages.length - 1]
                let otherMessages = messages.slice(0, messages.length - 1)

                return [...otherMessages, {...lastMessage, content: lastMessage.content + text},]
            })
            return reader.read().then(processText)
        })
    })
    
  }
  


  return (
   <Box 
     width="100vw"
     height="100vh"
     display="flex"
     flexDirection="column"
     justifyContent="center"
     alignItems="center"
    >
        <Stack direction={'column'} width="500px" height="700px" border="1px solid black" p={2} spacing={3}>
            <Stack direction={'column'} spacing={2} flexGrow={1} overflow="auto" maxHeight="100%">
                {
                    messages.map((message, index) =>  (
                        <Box
                          key={index}
                          display="flex"
                          justifyContent={message.role == "assistant" ? "flex-start" : "flex-end"}
                        >
                            <Box
                              bgcolor={message.role == "assistant" ? "primary.main" : "secondary.main"}
                              color="white"
                              borderRadius={16}
                              p={3}>
                                {message.content}
                            </Box>
                        </Box>
                    ))
                }
            </Stack>
            <Stack direction={'row'} spacing={2}>
                <TextField label="Message" fullWidth value={message} onChange={(e) => setMessage(e.target.value)}/>
                <Button variant="contained" onClick={sendMessage}>Send</Button>
            </Stack>
        </Stack>
        <Button 
          type="button"
          onClick={() => {
            signOut(auth) 
            sessionStorage.removeItem('user')
          }}
        >
            Log Out
        </Button>
      
    </Box> 
  )
}




/*
"use client";
import { useState, useEffect } from "react";
import { Box, Stack, TextField, Button } from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

export default function Home() {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [messages, setMessages] = useState([
        { role: "assistant", content: user ? `Hi ${user.displayName}! I'm the Headstarter support assistant. How can I help you today?` : "Hi! I'm the Headstarter support assistant. How can I help you today?" }
    ]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const userSession = sessionStorage.getItem('user');
        if (!user && !userSession) {
            router.push('sign-up');
        }
    }, [user, router]);

    const sendMessage = async () => {
        setMessage('');
        if (message.trim() === '') return;

        // Update messages with the new user message
        setMessages((prevMessages) => [...prevMessages, { role: "user", content: message }, { role: "assistant", content: " " }]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([...messages, { role: "user", content: message }]),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setMessages((prevMessages) => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                const otherMessages = prevMessages.slice(0, -1);
                return [...otherMessages, { ...lastMessage, content: data.content }];
            });
        } catch (error) {
            console.error('Error:', error);
            setMessages((prevMessages) => [...prevMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
        }

        
    };

    return (
        <Box
            width="100vw"
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
        >
            <Stack direction={'column'} width="500px" height="700px" border="1px solid black" p={2} spacing={3}>
                <Stack direction={'column'} spacing={2} flexGrow={1} overflow="auto" maxHeight="100%">
                    {
                        messages.map((msg, index) => (
                            <Box
                                key={index}
                                display="flex"
                                justifyContent={msg.role === "assistant" ? "flex-start" : "flex-end"}
                            >
                                <Box
                                    bgcolor={msg.role === "assistant" ? "primary.main" : "secondary.main"}
                                    color="white"
                                    borderRadius={16}
                                    p={3}
                                >
                                    {msg.content}
                                </Box>
                            </Box>
                        ))
                    }
                </Stack>
                <Stack direction={'row'} spacing={2}>
                    <TextField label="Message" fullWidth value={message} onChange={(e) => setMessage(e.target.value)} />
                    <Button variant="contained" onClick={sendMessage}>Send</Button>
                </Stack>
            </Stack>
            <Button
                type="button"
                onClick={() => {
                    signOut(auth);
                    sessionStorage.removeItem('user');
                }}
            >
                Log Out
            </Button>
        </Box>
    );
}*/