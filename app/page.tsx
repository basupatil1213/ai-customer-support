"use client";
import { model } from "@/config/openai-config";
import { Box, Button, Stack, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";

const OPENAI_MODELS = [
    "gpt-4o-mini",
    "gpt-4o",
    "gpt-4o-turbo",
    "gpt-4o-turbo-davinci",
    "gpt-4o-turbo-davinci-codex",
];

export default function Home() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hi! I'm the your support assistant. How can I help you today?",
        },
    ]);
    const [message, setMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currmodel, setCurrModel] = useState<string>(OPENAI_MODELS[0]);

    const sendMessage = async () => {
        if (!message.trim() || isLoading) return;
        setIsLoading(true);
        setMessage(""); // Clear the input field
        setMessages((messages) => [
            ...messages,
            { role: "user", content: message }, // Add the user's message to the chat
            { role: "assistant", content: "" }, // Add a placeholder for the assistant's response
        ]);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify([
                    ...messages,
                    { role: "user", content: message },
                    {model: currmodel}
                ]),
            });

            if (!res.body) {
                throw new Error("Response body is undefined");
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value, { stream: true });
                setMessages((messages) => {
                    const lastMessage = messages[messages.length - 1];
                    const otherMessages = messages.slice(0, -1);
                    return [
                        ...otherMessages,
                        { ...lastMessage, content: lastMessage.content + text },
                    ];
                });
            }
        } catch (error) {
            console.error("Error:", error);
            // Handle error (e.g., show error message to user)
            setMessages((messages) => [
                ...messages,
                {
                    role: "assistant",
                    content:
                        "I'm sorry, but I encountered an error. Please try again later.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <Box
            width="100vw"
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            bgcolor="background.default"
            >
              <Stack direction={"row"} spacing={2} style={{backgroundColor:"black"}}>
                {currmodel}
                <select onChange={
                    (e) => setCurrModel(e.target.value)
                } defaultChecked={true} defaultValue={currmodel} >
                  {OPENAI_MODELS.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </Stack>
            <Stack
                direction={"column"}
                width="500px"
                height="700px"
                border="1px solid black"
                p={2}
                spacing={3}>
                <Stack
                    direction={"column"}
                    spacing={2}
                    flexGrow={1}
                    overflow="auto"
                    maxHeight="100%">
                    {messages.map((message, index) => (
                        <Box
                            key={index}
                            display="flex"
                            justifyContent={
                                message.role === "assistant"
                                    ? "flex-start"
                                    : "flex-end"
                            }>
                            <Box
                                bgcolor={
                                    message.role === "assistant"
                                        ? "primary.main"
                                        : "secondary.main"
                                }
                                color="white"
                                borderRadius={16}
                                p={3}>
                                {message.content}
                            </Box>
                        </Box>
                    ))}
                </Stack>
                <Stack direction={"row"} spacing={2}>
                    <TextField
                        label="Message"
                        fullWidth
                        value={message}
                        onKeyDown={handleKeyPress}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button
                        variant="contained"
                        onClick={sendMessage}
                        disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send"}
                    </Button>
                </Stack>
            </Stack>
            <div ref={messagesEndRef} />
        </Box>
    );
}